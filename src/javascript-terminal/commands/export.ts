import { parseOptions } from "../parser";
import EmulatorState from "../emulator-state/EmulatorState";
import { AUTH_TOKEN_KEY, unexpiredToken } from "../../auth";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        const envVariables = state.getEnvVariables();
        return {
            output: Object.entries(envVariables)
                .map((entry) => `${entry[0]}=${entry[1]}`)
                .join("\n")
        };
    }

    try {
        const input = argv.join(" ");
        const match = input.match(/^(\w+)=(.*)$/);

        if (!match) {
            return { output: "export: invalid syntax. Use: export VAR=value", type: "error" };
        }

        const [, varName, varValue] = match;
        const envVariables = state.getEnvVariables();

        if (varName === AUTH_TOKEN_KEY && unexpiredToken(varValue)) {
            sessionStorage.setItem(AUTH_TOKEN_KEY, varValue!);
        }

        state.setEnvVariables({ ...envVariables, [varName]: varValue });
        return { output: "" };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     export -- set environment variables

SYNOPSIS
     export [NAME=value]

DESCRIPTION
     The export utility sets environment variables. If no arguments are given,
     it displays all current environment variables. When setting a variable,
     use the syntax NAME=value (e.g., export USER=john).`;

export default { optDef, functionDef };
