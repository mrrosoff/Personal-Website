import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {
    "-n, --number": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: cat [-n] [file ...]", type: "error" };
    }

    try {
        const filePaths = argv.map((pathArg) => relativeToAbsolutePath(state, pathArg));
        const contents = filePaths.map((path) => FileOp.read(state.getFileSystem(), path));

        if (options.number) {
            const numberedContents = contents.map((content) => {
                const lines = content.split("\n");
                return lines
                    .map(
                        (line: string, index: number) =>
                            `${String(index + 1).padStart(6, " ")}\t${line}`
                    )
                    .join("\n");
            });
            return { output: numberedContents.join("\n") };
        }

        return { output: contents.join("\n") };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
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

export default { optDef, functionDef };
