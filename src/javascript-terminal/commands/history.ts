import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        return { output: state.getHistory().join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     history -- command history

SYNOPSIS
     history

DESCRIPTION
     Display the command history list with line numbers.`;

export default { optDef, functionDef };
