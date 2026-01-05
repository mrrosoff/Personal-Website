import axios from "axios";
import { startAuthentication } from "@simplewebauthn/browser";

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
    _password: string,
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
            const { data: authOptions } = await axios.post(
                "https://api.maxrosoff.com/admin/passkey-auth-options"
            );

            const authResponse = await startAuthentication(authOptions);

            const { data: authResult } = await axios.post("https://api.maxrosoff.com/admin/passkey-auth", {
                response: authResponse
            });

            const existingAdminMode = emulatorState.getAdminConsoleMode();
            emulatorState.setAdminConsoleMode({
                ...existingAdminMode,
                password: "passkey-authenticated",
                authToken: authResult.token
            });

            emulatorState.setPasswordPromptState({
                ...promptState,
                verifiedPassword: "passkey-authenticated"
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
            console.error("Authentication Failed:", err);
            emulatorState.setPasswordPromptState(undefined);

            const outputs = emulatorState.getOutputs();
            if (outputs.length > 0) {
                const lastOutput = outputs[outputs.length - 1];
                lastOutput.output = [{ output: "Authentication Failed", type: "error" }];
                emulatorState.setOutputs([...outputs]);
            }
            return true;
        }
    }
    return false;
};

export const manPage = `NAME
     sudo -- execute a command as the superuser

SYNOPSIS
     sudo command [arguments]

DESCRIPTION
     The sudo utility allows a permitted user to execute a command with
     elevated privileges. You will be prompted for a password before the
     command is executed.`;

export default { optDef, functionDef };
