import type EmulatorState from "../emulatorState/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);
    const envVariables = state.getEnvVariables();

    if (argv.length === 0) {
        return {
            output: Object.entries(envVariables)
                .map(([name, value]) => `${name}=${String(value)}`)
                .join("\n")
        };
    }

    const varValue = envVariables[argv[0]];

    if (varValue) {
        return { output: varValue };
    }

    return {};
};

export const manPage = `NAME
     printenv -- print environment variables

SYNOPSIS
     printenv [variable]

DESCRIPTION
     Print the values of the specified environment variable(s). If no variable
     is specified, print name and value pairs for them all.`;
