import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { fsSearch } from "../fs/operations/base-operations";
import { FileSystem } from "../../FileSystem";

export const optDef = {
    "-name": "<pattern>"
};

const findInDirectory = (
    fs: FileSystem,
    path: string,
    namePattern: string | undefined,
    results: string[] = []
): string[] => {
    try {
        const dirContents = fsSearch(fs, path);

        Object.keys(dirContents).forEach((name) => {
            const fullPath = path === "/" ? `/${name}` : `${path}/${name}`;

            let matches = true;
            if (namePattern) {
                const regex = new RegExp(
                    "^" + namePattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
                );
                matches = regex.test(name);
            }

            if (matches) {
                results.push(fullPath);
            }

            if (dirContents[name].type === "d") {
                findInDirectory(fs, fullPath, namePattern, results);
            }
        });
    } catch (err) {
    }

    return results;
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const searchPath =
            argv.length > 0 ? relativeToAbsolutePath(state, argv[0]) : state.getEnvVariables().cwd;
        const namePattern = options.name as string | undefined;
        const results = findInDirectory(state.getFileSystem(), searchPath, namePattern);

        return { output: results.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     find -- walk a file hierarchy

SYNOPSIS
     find [path] [-name pattern]

DESCRIPTION
     The find utility recursively descends the directory tree for the given
     path (or current directory if not specified), listing all files and
     directories found.

OPTIONS
     -name pattern    Search for files matching the pattern. Supports wildcards:
                      * matches any sequence of characters
                      ? matches any single character`;

export default { optDef, functionDef };
