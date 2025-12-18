import axios from "axios";
import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";
import * as CommandMappingUtil from "../emulator-state/CommandMapping";
import Emulator from "../emulator";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {
            type: "error",
            output: `Must Specify A Command To Run With "sudo"`
        };
    }

    const adminMode = state.getAdminConsoleMode();
    if (adminMode?.password) {
        const targetCommand = argv[0];
        const targetOptions = argv.slice(1);
        const commandMapping = state.getCommandMapping();

        const commandFn: any = CommandMappingUtil.getCommandFn(commandMapping, targetCommand);
        if (!commandFn) {
            return { output: "Command Not Found", type: "error" };
        }

        try {
            return commandFn(state, targetOptions);
        } catch (err) {
            console.error(err);
            return { output: "Command Execution Failed", type: "error" };
        }
    }

    state.setPasswordPromptState({
        targetCommand: argv[0],
        targetOptions: argv.slice(1)
    });
    return { output: "", type: "text" };
};

export const handlePasswordPromptKeyPress = async (
    emulator: Emulator,
    emulatorState: EmulatorState,
    password: string,
    key: string,
    ctrlKey: boolean = false
): Promise<boolean> => {
    const promptState = emulatorState.getPasswordPromptState();
    if (!promptState) return false;

    if (key === "c" && ctrlKey) {
        emulatorState.setPasswordPromptState(undefined);
        return true;
    }

    if (key === "Enter") {
        try {
            await axios.post("https://api.maxrosoff.com/admin/password-check", { password });

            const existingAdminMode = emulatorState.getAdminConsoleMode();
            emulatorState.setAdminConsoleMode({
                ...existingAdminMode,
                password
            });

            emulatorState.setPasswordPromptState({
                ...promptState,
                verifiedPassword: password
            });

            const commandMapping = emulatorState.getCommandMapping();
            const result = emulator.runCommand(commandMapping, promptState.targetCommand, [
                emulatorState,
                promptState.targetOptions
            ]);

            emulatorState.setPasswordPromptState(undefined);

            const outputs = emulatorState.getOutputs();
            if (outputs.length > 0) {
                const lastOutput = outputs[outputs.length - 1];
                lastOutput.output = [result];
                emulatorState.setOutputs([...outputs]);
            }

            return true;
        } catch (err) {
            console.error("Password Validation Failed:", err);
            emulatorState.setPasswordPromptState(undefined);

            const outputs = emulatorState.getOutputs();
            if (outputs.length > 0) {
                const lastOutput = outputs[outputs.length - 1];
                lastOutput.output = [{ output: "Invalid Password", type: "error" }];
                emulatorState.setOutputs([...outputs]);
            }
            return true;
        }
    }
    return false;
};

export default { optDef, functionDef };
