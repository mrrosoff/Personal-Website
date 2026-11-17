import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    return { output: state.getHistory().join("\n") };
};

export const manPage = `NAME
     history -- command history

SYNOPSIS
     history

DESCRIPTION
     Display the command history list with line numbers.`;

export default { optDef, functionDef, manPage };
