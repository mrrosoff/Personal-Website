import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = { "-v, --verbose": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return { output: "usage: mv [-v] source target", type: "error" };
    }

    try {
        const srcPath = relativeToAbsolutePath(state, argv[0]);
        const destPath = relativeToAbsolutePath(state, argv[1]);

        if (srcPath === destPath) {
            return { output: "Source and destination are the same (not copied)." };
        }

        DirOp.rename(state.getFileSystem(), srcPath, destPath);

        if (options.verbose) {
            return { output: `'${argv[0]}' -> '${argv[1]}'` };
        }

        return { output: "" };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     mv -- move (rename) files

SYNOPSIS
     mv [-v] source target

DESCRIPTION
     Move SOURCE to DEST, or rename SOURCE to DEST.

OPTIONS
     -v, --verbose    Explain what is being done`;

export default { optDef, functionDef };
