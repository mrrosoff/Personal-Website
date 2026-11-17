import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as FileOp from "../fs/operations/fileOperations";
import { fsSearchParent } from "../fs/operations/baseOperations";
import { getLastPathPart } from "../fs/util/pathUtil";
import { isDirectory } from "../fs/util/fileUtil";

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

    const pattern = argv[0];
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
                matchingLines.push(`${(index + 1).toString()}:${line}`);
            } else {
                matchingLines.push(line);
            }
        }
    });

    return { output: matchingLines.join("\n") };
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

export default { optDef, functionDef, manPage };
