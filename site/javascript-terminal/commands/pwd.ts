import type EmulatorState from "../emulatorState/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    return { output: state.getEnvVariables().cwd };
};

export const manPage = `NAME
     pwd -- print working directory

SYNOPSIS
     pwd

DESCRIPTION
     Print the absolute pathname of the current working directory.`;

export default { optDef, functionDef, manPage };
