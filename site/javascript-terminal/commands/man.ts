import type EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

export const manPage = `NAME
     man -- display manual pages

SYNOPSIS
     man command

DESCRIPTION
     The man utility displays the manual page for the specified command.`;

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length !== 1) {
        return {};
    }

    return { output: state.getCommandMapping()[argv[0]]?.manPage ?? "" };
};

export default { optDef, functionDef, manPage };
