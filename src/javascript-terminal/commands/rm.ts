import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {
    "--no-preserve-root, --noPreserveRoot": "",
    "-r, --recursive": "",
    "-f, --force": "",
    "-v, --verbose": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "", type: "text" };
    }

    try {
        const deletionPath = relativeToAbsolutePath(state, argv[0]);
        const fs = state.getFileSystem();

        if (deletionPath === "/" && options.noPreserveRoot !== true) {
            return { output: "", type: "text" };
        }

        options.recursive === true
            ? DirOp.remove(fs, deletionPath)
            : FileOp.remove(fs, deletionPath);

        if (options.verbose) {
            return { output: `removed '${argv[0]}'` };
        }

        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     rm -- remove files or directories

SYNOPSIS
     rm [-rfv] file

DESCRIPTION
     The rm utility attempts to remove the non-directory type files specified.
     If the -r or -R option is specified, rm removes file hierarchies.

OPTIONS
     -r, --recursive    Remove directories and their contents recursively
     -f, --force        Ignore nonexistent files and arguments, never prompt
     -v, --verbose      Explain what is being done`;

export default { optDef, functionDef };
