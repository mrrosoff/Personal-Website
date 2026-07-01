import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        return { output: state.getEnvVariables().cwd };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     pwd -- print working directory

SYNOPSIS
     pwd

DESCRIPTION
     Print the absolute pathname of the current working directory.`;

export default { optDef, functionDef };
