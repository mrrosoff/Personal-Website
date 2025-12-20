import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        state.setOutputs([]);
        return {};
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     clear -- clear the terminal screen

SYNOPSIS
     clear

DESCRIPTION
     Clears your screen if it is possible, including its scrollback buffer.`;

export default { optDef, functionDef };
