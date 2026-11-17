import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";

export const optDef = {};

export const functionDef = (_state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "dirname: missing operand", type: "error" };
    }

    const path = argv[0];

    const cleanPath = path.replace(/\/+$/, "");

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
