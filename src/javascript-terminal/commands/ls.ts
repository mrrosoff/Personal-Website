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

const makeLongFormatReturn = (
    fs: any,
    dirPath: string,
    listing: string[]
) => {
    const dirContents = PathUtil.toPathParts(dirPath).reduce(
        (section, part) => section[part]?.contents || section,
        fs
    );

    const formattedLines = listing
        .sort()
        .map((name) => {
            if (name === "." || name === "..") {
                return `drwx------ ${name}`;
            }
            const file = dirContents[name];
            if (!file) {
                return null;
            }
            return `${file.type}${file.permissions} ${name}`;
        })
        .filter((line) => line !== null);

    return { output: formattedLines.join("\n") };
};

export const optDef = { "-a, --all": "", "-A, --almost-all": "", "-l, --long": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const dirPath = resolveDirectoryToList(state.getEnvVariables(), argv);
        const dirList = DirOp.list(state.getFileSystem(), dirPath);

        let listing: string[];
        if (options.all) {
            listing = IMPLIED_DIRECTORY_ENTRIES.concat(dirList);
        } else if (options.almostAll) {
            listing = dirList;
        } else {
            listing = dirList.filter((record) => !record.startsWith("."));
        }

        if (options.long) {
            return makeLongFormatReturn(state.getFileSystem(), dirPath, listing);
        }

        return makeSortedReturn(listing);
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     ls -- list directory contents

SYNOPSIS
     ls [-aAl] [file ...]

DESCRIPTION
     For each operand that names a file of a type other than directory, ls
     displays its name as well as any requested, associated information.  For
     each operand that names a file of type directory, ls displays the names
     of files contained within that directory, as well as any requested, associated
     information.

OPTIONS
     -a, --all         Include directory entries whose names begin with a dot (.)
     -A, --almost-all  Include directory entries whose names begin with a dot (.)
                       except for . and ..
     -l, --long        List in long format, showing type, permissions, and name`;

export default { optDef, functionDef };
