import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as FileOp from "../fs/operations/fileOperations";

export const optDef = { "-n, --lines": "<count>" };

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: head [-n count] [file]", type: "error" };
    }

    const filePath = relativeToAbsolutePath(state, argv[0]);
    const file = FileOp.read(state.getFileSystem(), filePath);
    const lineCount = Number(options.lines ?? 10);

    return { output: file.split("\n").slice(0, lineCount).join("\n") };
};

export const manPage = `NAME
     head -- display first lines of a file

SYNOPSIS
     head [-n count] [file]

DESCRIPTION
     This filter displays the first count lines of each of the specified files.
     If count is omitted it defaults to 10.`;
