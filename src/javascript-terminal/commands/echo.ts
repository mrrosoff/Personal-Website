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
        (match, varName) => environmentVariables[varName] || ""
    );
};

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const input = commandOptions.join(" ");
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

export default { optDef, functionDef };
