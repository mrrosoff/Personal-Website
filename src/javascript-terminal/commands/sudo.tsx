import axios from "axios";
import { startAuthentication } from "@simplewebauthn/browser";

import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";
import * as CommandMappingUtil from "../emulator-state/CommandMapping";
import Emulator from "../emulator";
import { API_URL } from "../../components/App";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {
            type: "error",
            output: `Must Specify A Command To Run With "sudo"`
        };
    }

    const environmentVariables = state.getEnvVariables();
    if (environmentVariables["AUTH_TOKEN"]) {
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

export const authenticateWithPasskey = async (
    emulator: Emulator,
    emulatorState: EmulatorState
): Promise<void> => {
    const promptState = emulatorState.getPasswordPromptState();
    if (!promptState) return;

    try {
        const { data: authOptions } = await axios.post(`${API_URL}/admin/passkey-auth-options`);

        emulatorState.setPasswordPromptState({ ...promptState, loading: true });

        const authResponse = await startAuthentication({ optionsJSON: authOptions });
        const { data: authResult } = await axios.post(`${API_URL}/admin/passkey-auth`, {
            response: authResponse,
            challenge: authOptions.challenge
        });

        const existingVars = emulatorState.getEnvVariables();
        emulatorState.setEnvVariables({ ...existingVars, AUTH_TOKEN: authResult.token });

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
    } catch (err) {
        console.error("Authentication Failed:", err);
        emulatorState.setPasswordPromptState(undefined);

        const outputs = emulatorState.getOutputs();
        if (outputs.length > 0) {
            const lastOutput = outputs[outputs.length - 1];
            lastOutput.output = [{ output: "Authentication Failed", type: "error" }];
            emulatorState.setOutputs([...outputs]);
        }
    }
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
