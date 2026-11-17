import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as DirOp from "../fs/operations/directoryOperations";

export const optDef = { "-v, --verbose": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return { output: "usage: mv [-v] source target", type: "error" };
    }

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
};

export const manPage = `NAME
     mv -- move (rename) files

SYNOPSIS
     mv [-v] source target

DESCRIPTION
     Move SOURCE to DEST, or rename SOURCE to DEST.

OPTIONS
     -v, --verbose    Explain what is being done`;

export default { optDef, functionDef, manPage };
