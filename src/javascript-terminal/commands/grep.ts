import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";
import { fsSearchParent } from "../fs/operations/base-operations";
import { getLastPathPart } from "../fs/util/path-util";
import { isDirectory } from "../fs/util/file-util";

export const optDef = {
    "-i, --ignore-case": "",
    "-n, --line-number": "",
    "-v, --invert-match": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 1) {
        return { output: "grep: missing pattern", type: "error" };
    }

    if (argv.length < 2) {
        return { output: "grep: missing file operand", type: "error" };
    }

    try {
        let pattern = argv[0];
        const filePath = relativeToAbsolutePath(state, argv[1]);

        const fsPart = fsSearchParent(state.getFileSystem(), filePath);
        const target = fsPart[getLastPathPart(filePath)];

        if (!target) {
            throw Error("No such file or directory: " + argv[1]);
        }

        if (isDirectory(target)) {
            return { output: `grep: ${argv[1]}: Is a directory`, type: "error" };
        }

        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        const lines = fileContent.split("\n");
        const matchingLines: string[] = [];

        lines.forEach((line: string, index: number) => {
            let matches: boolean;

            if (options.ignoreCase) {
                matches = line.toLowerCase().includes(pattern.toLowerCase());
            } else {
                matches = line.includes(pattern);
            }

            if (options.invertMatch) {
                matches = !matches;
            }

            if (matches) {
                if (options.lineNumber) {
                    matchingLines.push(`${index + 1}:${line}`);
                } else {
                    matchingLines.push(line);
                }
            }
        });

        return { output: matchingLines.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     grep -- search for patterns in files

SYNOPSIS
     grep [-inv] pattern file

DESCRIPTION
     The grep utility searches the specified file for lines containing a match
     to the given pattern. By default, grep prints the matching lines.

OPTIONS
     -i, --ignore-case    Perform case-insensitive matching
     -n, --line-number    Prefix each line with its line number
     -v, --invert-match   Select non-matching lines`;

export default { optDef, functionDef };
