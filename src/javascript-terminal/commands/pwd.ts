import EmulatorState from "../emulator-state/EmulatorState";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        return { output: state.getEnvVariables().cwd };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     pwd -- print working directory

SYNOPSIS
     pwd

DESCRIPTION
     Print the absolute pathname of the current working directory.`;

export default { optDef, functionDef };
