import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {
    "-c, --count": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "uniq: missing file operand", type: "error" };
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        const lines = fileContent.split("\n");
        const uniqueLines: Array<{ line: string; count: number }> = [];
        let previousLine = "";
        let currentCount = 0;

        lines.forEach((line: string) => {
            if (line === previousLine) {
                currentCount++;
            } else {
                if (previousLine !== "") {
                    uniqueLines.push({ line: previousLine, count: currentCount });
                }
                previousLine = line;
                currentCount = 1;
            }
        });

        if (previousLine !== "") {
            uniqueLines.push({ line: previousLine, count: currentCount });
        }

        if (options.count) {
            return {
                output: uniqueLines
                    .map(({ line, count }) => `${String(count).padStart(7, " ")} ${line}`)
                    .join("\n")
            };
        }

        return { output: uniqueLines.map(({ line }) => line).join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     uniq -- remove duplicate lines from a file

SYNOPSIS
     uniq [-c] file

DESCRIPTION
     The uniq utility reads the specified file and removes consecutive
     duplicate lines, writing the result to standard output. Only adjacent
     duplicate lines are removed, so the file should be sorted first for
     best results.

OPTIONS
     -c, --count    Precede each output line with the count of occurrences`;

export default { optDef, functionDef };
