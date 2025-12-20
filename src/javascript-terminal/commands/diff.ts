import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return { output: "diff: missing operand", type: "error" };
    }

    try {
        const file1Path = relativeToAbsolutePath(state, argv[0]);
        const file2Path = relativeToAbsolutePath(state, argv[1]);

        const file1Content = FileOp.read(state.getFileSystem(), file1Path);
        const file2Content = FileOp.read(state.getFileSystem(), file2Path);

        const file1Lines = file1Content.split("\n");
        const file2Lines = file2Content.split("\n");

        const output: string[] = [];
        const maxLines = Math.max(file1Lines.length, file2Lines.length);

        let hasDifferences = false;

        for (let i = 0; i < maxLines; i++) {
            const line1 = file1Lines[i];
            const line2 = file2Lines[i];

            if (line1 !== line2) {
                hasDifferences = true;
                if (line1 !== undefined) {
                    output.push(`< ${line1}`);
                }
                if (line2 !== undefined) {
                    output.push(`> ${line2}`);
                }
                if (i < maxLines - 1) {
                    output.push("---");
                }
            }
        }

        if (!hasDifferences) {
            return { output: "" };
        }

        return { output: output.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     diff -- compare files line by line

SYNOPSIS
     diff file1 file2

DESCRIPTION
     The diff utility compares two files and displays the differences between
     them. Lines from file1 are prefixed with '<' and lines from file2 are
     prefixed with '>'.`;

export default { optDef, functionDef };
