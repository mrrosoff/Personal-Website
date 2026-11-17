import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as FileOp from "../fs/operations/fileOperations";

export const optDef = { "-n, --lines": "<count>" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: tail [-n count] [file]", type: "error" };
    }

    const filePath = relativeToAbsolutePath(state, argv[0]);
    const file = FileOp.read(state.getFileSystem(), filePath);
    const lineCount = Number(options.lines ?? 10);

    return {
        output: file
            .split("\n")
            .slice(-1 * lineCount)
            .join("\n")
    };
};

export const manPage = `NAME
     tail -- display last lines of a file

SYNOPSIS
     tail [-n count] [file]

DESCRIPTION
     This filter displays the last count lines of each of the specified files.
     If count is omitted it defaults to 10.`;

export default { optDef, functionDef, manPage };
