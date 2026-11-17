import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    state.setOutputs([]);
    return {};
};

export const manPage = `NAME
     clear -- clear the terminal screen

SYNOPSIS
     clear

DESCRIPTION
     Clears your screen if it is possible, including its scrollback buffer.`;

export default { optDef, functionDef, manPage };
