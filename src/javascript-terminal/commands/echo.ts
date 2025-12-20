import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

const VARIABLE_GROUP_REGEX = /\$(\w+)/g;
const DOUBLE_SPACE_REGEX = /\s\s+/g;

const substituteEnvVariables = (
    environmentVariables: { [x: string]: string },
    inputStr: string
) => {
    return inputStr.replace(
        VARIABLE_GROUP_REGEX,
        (_match, varName) => environmentVariables[varName] || ""
    );
};

export const optDef = {
    "-n": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const input = argv.join(" ");
        const outputStr = substituteEnvVariables(state.getEnvVariables(), input);
        let cleanStr = outputStr.trim().replace(DOUBLE_SPACE_REGEX, " ");

        if (cleanStr[0] === '"' && cleanStr[cleanStr.length - 1] === '"') {
            cleanStr = cleanStr.slice(1, cleanStr.length - 1);
        }

        return { output: cleanStr };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     echo -- display a line of text

SYNOPSIS
     echo [-n] STRING

DESCRIPTION
     The echo prints either the specified string or an environment variable to
     the standard output. Environment variables are expanded using $VAR syntax.

OPTIONS
     -n    Do not output the trailing newline`;

export default { optDef, functionDef };
