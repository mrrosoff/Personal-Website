import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return {};
    }

    try {
        const pattern = argv[0];
        const filePath = relativeToAbsolutePath(state, argv[1]);
        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        const matchingLines = fileContent
            .split("\n")
            .filter((line: string) => line.includes(pattern));

        return { output: matchingLines.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     grep -- search for patterns in files

SYNOPSIS
     grep pattern file

DESCRIPTION
     The grep utility searches the specified file for lines containing a match
     to the given pattern. By default, grep prints the matching lines.`;

export default { optDef, functionDef };
