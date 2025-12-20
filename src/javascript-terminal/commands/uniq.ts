import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "uniq: missing file operand", type: "error" };
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        const lines = fileContent.split("\n");
        const uniqueLines: string[] = [];
        let previousLine = "";

        lines.forEach((line: string) => {
            if (line !== previousLine) {
                uniqueLines.push(line);
                previousLine = line;
            }
        });

        return { output: uniqueLines.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     uniq -- remove duplicate lines from a file

SYNOPSIS
     uniq file

DESCRIPTION
     The uniq utility reads the specified file and removes consecutive
     duplicate lines, writing the result to standard output. Only adjacent
     duplicate lines are removed, so the file should be sorted first for
     best results.`;

export default { optDef, functionDef };
