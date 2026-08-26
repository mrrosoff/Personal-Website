import EmulatorState from "../emulator-state/EmulatorState";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        state.setOutputs([]);
        return {};
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     clear -- clear the terminal screen

SYNOPSIS
     clear

DESCRIPTION
     Clears your screen if it is possible, including its scrollback buffer.`;

export default { optDef, functionDef };
