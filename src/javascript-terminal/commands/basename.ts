import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (_state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "basename: missing operand", type: "error" };
    }

    try {
        const path = argv[0];
        const suffix = argv[1];

        let cleanPath = path.replace(/\/+$/, "");

        const lastSlashIndex = cleanPath.lastIndexOf("/");
        let basename = lastSlashIndex === -1 ? cleanPath : cleanPath.slice(lastSlashIndex + 1);

        if (suffix && basename.endsWith(suffix)) {
            basename = basename.slice(0, -suffix.length);
        }

        return { output: basename };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     basename -- return filename portion of pathname

SYNOPSIS
     basename path [suffix]

DESCRIPTION
     The basename utility returns the last component of a pathname. If suffix
     is specified and matches the end of the basename, it is removed.

     Examples:
       basename /path/to/file.txt        → file.txt
       basename /path/to/file.txt .txt   → file
       basename /path/to/dir/            → dir`;

export default { optDef, functionDef };
