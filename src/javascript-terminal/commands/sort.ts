import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        const sortedLines = fileContent
            .split("\n")
            .sort();

        return { output: sortedLines.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     sort -- sort lines of text files

SYNOPSIS
     sort [file]

DESCRIPTION
     The sort utility sorts text files by lines. Lines are sorted
     alphabetically by default.`;

export default { optDef, functionDef };
