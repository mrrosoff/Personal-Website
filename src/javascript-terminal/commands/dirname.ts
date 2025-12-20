import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (_state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "dirname: missing operand", type: "error" };
    }

    try {
        const path = argv[0];

        let cleanPath = path.replace(/\/+$/, "");

        if (cleanPath === "" || cleanPath === "/") {
            return { output: "/" };
        }

        const lastSlashIndex = cleanPath.lastIndexOf("/");

        if (lastSlashIndex === -1) {
            return { output: "." };
        }

        if (lastSlashIndex === 0) {
            return { output: "/" };
        }

        const dirname = cleanPath.slice(0, lastSlashIndex);
        return { output: dirname };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     dirname -- return directory portion of pathname

SYNOPSIS
     dirname path

DESCRIPTION
     The dirname utility returns the directory portion of a pathname, removing
     the last component and trailing slashes.

     Examples:
       dirname /path/to/file.txt    → /path/to
       dirname /path/to/dir/        → /path/to
       dirname file.txt             → .
       dirname /file.txt            → /`;

export default { optDef, functionDef };
