import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {
    "--no-preserve-root, --noPreserveRoot": "",
    "-r, --recursive": "",
    "-f, --force": ""
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
        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     rm -- remove files or directories

SYNOPSIS
     rm [-rf] file

DESCRIPTION
     The rm utility attempts to remove the non-directory type files specified.
     If the -r or -R option is specified, rm removes file hierarchies.`;

export default { optDef, functionDef };
