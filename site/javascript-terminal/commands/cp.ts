import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as DirOp from "../fs/operations/directoryOperations";
import * as FileOp from "../fs/operations/fileOperations";

export const optDef = {
    "-r, --recursive": "",
    "-v, --verbose": ""
};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return { output: "usage: cp [-rv] source dest", type: "error" };
    }

    const srcPath = relativeToAbsolutePath(state, argv[0]);
    const destPath = relativeToAbsolutePath(state, argv[1]);

    if (srcPath === destPath) {
        return { output: "Source and destination are the same (not copied)." };
    }

    if (options.recursive) {
        DirOp.copy(state.getFileSystem(), srcPath, destPath);
    } else {
        FileOp.copy(state.getFileSystem(), srcPath, destPath);
    }

    if (options.verbose) {
        return { output: `'${argv[0]}' -> '${argv[1]}'` };
    }

    return { output: "" };
};

export const manPage = `NAME
     cp -- copy files and directories

SYNOPSIS
     cp [-rv] SOURCE DEST

DESCRIPTION
     Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.

OPTIONS
     -r, --recursive    Copy directories recursively
     -v, --verbose      Explain what is being done`;
