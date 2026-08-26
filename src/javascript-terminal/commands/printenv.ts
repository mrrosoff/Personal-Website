import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);
    const envVariables = state.getEnvVariables();

    if (argv.length === 0) {
        return {
            output: Object.entries(envVariables)
                .map((entry) => entry[0] + "=" + entry[1])
                .join("\n")
        };
    }

    try {
        const varValue = envVariables[argv[0]];

        if (varValue) {
            return { output: varValue };
        }

        return {};
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     printenv -- print environment variables

SYNOPSIS
     printenv [variable]

DESCRIPTION
     Print the values of the specified environment variable(s). If no variable
     is specified, print name and value pairs for them all.`;

export default { optDef, functionDef };
