import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {
    "-r, --recursive": "",
    "-v, --verbose": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return {};
    }

    try {
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
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
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

export default { optDef, functionDef };
