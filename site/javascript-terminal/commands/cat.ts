import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as FileOp from "../fs/operations/fileOperations";

export const optDef = {
    "-n, --number": ""
};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: cat [-n] [file ...]", type: "error" };
    }

    const filePaths = argv.map((pathArg) => relativeToAbsolutePath(state, pathArg));
    const contents = filePaths.map((path) => FileOp.read(state.getFileSystem(), path));

    if (options.number) {
        const numberedContents = contents.map((content) => {
            const lines = content.split("\n");
            return lines
                .map(
                    (line: string, index: number) =>
                        `${(index + 1).toString().padStart(6, " ")}\t${line}`
                )
                .join("\n");
        });
        return { output: numberedContents.join("\n") };
    }

    return { output: contents.join("\n") };
};

export const manPage = `NAME
     cat -- concatenate and print files

SYNOPSIS
     cat [-n] [file ...]

DESCRIPTION
     The cat utility reads files sequentially, writing them to the standard
     output.

OPTIONS
     -n, --number    Number all output lines`;
