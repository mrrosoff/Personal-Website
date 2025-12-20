import assert from "assert";

import { parseOptions } from "../parser";
import * as PathUtil from "../fs/util/path-util";
import * as DirOp from "../fs/operations/directory-operations";
import EmulatorState from "../emulator-state/EmulatorState";

const IMPLIED_DIRECTORY_ENTRIES = [".", ".."];

const resolveDirectoryToList = (envVariables: Record<string, string>, argv: string | string[]) => {
    const cwd = envVariables.cwd;

    if (argv.length > 0) {
        return PathUtil.toAbsolutePath(argv[0], cwd);
    }

    return cwd;
};

const makeSortedReturn = (listing: string[]) => {
    return { output: listing.sort().join("\n") };
};

export const optDef = { "-a, --all": "", "-A, --almost-all": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const dirPath = resolveDirectoryToList(state.getEnvVariables(), argv);
        const dirList = DirOp.list(state.getFileSystem(), dirPath);

        if (options.all) {
            return makeSortedReturn(IMPLIED_DIRECTORY_ENTRIES.concat(dirList));
        } else if (options.almostAll) {
            return makeSortedReturn(dirList);
        }

        return makeSortedReturn(dirList.filter((record) => !record.startsWith(".")));
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     ls -- list directory contents

SYNOPSIS
     ls [file ...]

DESCRIPTION
     For each operand that names a file of a type other than directory, ls
     displays its name as well as any requested, associated information.  For
     each operand that names a file of type directory, ls displays the names
     of files contained within that directory, as well as any requested, associated
     information.`;

export default { optDef, functionDef };
