import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {
    "-r, --reverse": "",
    "-n, --numeric-sort": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        let sortedLines = fileContent.split("\n");

        if (options.numericSort) {
            sortedLines = sortedLines.sort((a: string, b: string) => {
                const numA = parseFloat(a);
                const numB = parseFloat(b);
                return numA - numB;
            });
        } else {
            sortedLines = sortedLines.sort();
        }

        if (options.reverse) {
            sortedLines = sortedLines.reverse();
        }

        return { output: sortedLines.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     sort -- sort lines of text files

SYNOPSIS
     sort [-rn] [file]

DESCRIPTION
     The sort utility sorts text files by lines. Lines are sorted
     alphabetically by default.

OPTIONS
     -r, --reverse        Reverse the sort order
     -n, --numeric-sort   Sort numerically instead of alphabetically`;

export default { optDef, functionDef };
