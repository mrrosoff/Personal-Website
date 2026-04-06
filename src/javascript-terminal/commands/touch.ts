import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { makeEmptyFile } from "../fs/util/file-util";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: touch file", type: "error" };
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        FileOp.write(state.getFileSystem(), filePath, makeEmptyFile());
        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     touch -- create empty file or change file timestamps

SYNOPSIS
     touch file

DESCRIPTION
     The touch utility creates an empty file if it does not exist.`;

export default { optDef, functionDef };
