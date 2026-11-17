import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import { makeEmptyFile } from "../fs/util/fileUtil";
import * as FileOp from "../fs/operations/fileOperations";

export const optDef = {};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: touch file", type: "error" };
    }

    const filePath = relativeToAbsolutePath(state, argv[0]);
    FileOp.write(state.getFileSystem(), filePath, makeEmptyFile());
    return { output: "" };
};

export const manPage = `NAME
     touch -- create empty file or change file timestamps

SYNOPSIS
     touch file

DESCRIPTION
     The touch utility creates an empty file if it does not exist.`;
