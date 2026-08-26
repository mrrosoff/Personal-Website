import EmulatorState from "../emulator-state/EmulatorState";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        return { output: state.getHistory().join("\n") };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     history -- command history

SYNOPSIS
     history

DESCRIPTION
     Display the command history list with line numbers.`;

export default { optDef, functionDef };
