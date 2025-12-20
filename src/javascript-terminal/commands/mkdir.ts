import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { makeEmptyDirectory } from "../fs/util/file-util";
import * as DirOp from "../fs/operations/directory-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
        const newFolderPath = relativeToAbsolutePath(state, argv[0]);
        DirOp.add(state.getFileSystem(), newFolderPath, makeEmptyDirectory());

        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     mkdir -- make directories

SYNOPSIS
     mkdir directory_name

DESCRIPTION
     The mkdir utility creates the directory specified.`;

export default { optDef, functionDef };
