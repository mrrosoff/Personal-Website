import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "tee: missing file operand", type: "error" };
    }

    try {
        const content = argv[0];
        const filePaths = argv.slice(1);

        if (filePaths.length === 0) {
            return { output: "tee: missing file operand", type: "error" };
        }

        filePaths.forEach((pathArg) => {
            const filePath = relativeToAbsolutePath(state, pathArg);
            const file = { type: "-" as const, permissions: "rwx------", contents: content };
            FileOp.write(state.getFileSystem(), filePath, file);
        });

        return { output: content };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     tee -- write output to files and stdout

SYNOPSIS
     tee text file [file ...]

DESCRIPTION
     The tee utility writes the given text to the specified file(s) and also
     displays it to standard output. This allows you to both save and view
     output simultaneously.`;

export default { optDef, functionDef };
