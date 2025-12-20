import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        return {
            output: state.getEnvVariables().user ? state.getEnvVariables().user : "dev"
        };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     whoami -- display effective user name

SYNOPSIS
     whoami

DESCRIPTION
     The whoami utility displays your effective user name.`;

export default { optDef, functionDef };
