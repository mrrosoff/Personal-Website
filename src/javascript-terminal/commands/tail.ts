import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = { "-n, --lines": "<count>" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: tail [-n count] [file]", type: "error" };
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        const file = FileOp.read(state.getFileSystem(), filePath);
        const lineCount = options.lines ? options.lines : 10;

        return {
            output: file
                .split("\n")
                .slice(-1 * lineCount)
                .join("\n")
        };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     tail -- display last lines of a file

SYNOPSIS
     tail [-n count] [file]

DESCRIPTION
     This filter displays the last count lines of each of the specified files.
     If count is omitted it defaults to 10.`;

export default { optDef, functionDef };
