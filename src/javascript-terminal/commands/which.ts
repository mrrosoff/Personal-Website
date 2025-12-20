import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState from "../emulator-state/EmulatorState";
import * as CommandMappingUtil from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "which: missing command operand", type: "error" };
    }

    try {
        const commandName = argv[0];
        const commandMapping = state.getCommandMapping();

        if (CommandMappingUtil.isCommandSet(commandMapping, commandName)) {
            return { output: `/bin/${commandName}` };
        }

        return { output: `${commandName}: command not found`, type: "error" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     which -- locate a command

SYNOPSIS
     which command

DESCRIPTION
     The which utility locates a command and displays its path. This is useful
     for checking if a command exists and where it is located in the system.`;

export default { optDef, functionDef };
