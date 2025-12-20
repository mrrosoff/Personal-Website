import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { fsSearch } from "../fs/operations/base-operations";
import { FileSystem } from "../../FileSystem";

export const optDef = {};

const findInDirectory = (fs: FileSystem, path: string, results: string[] = []): string[] => {
    try {
        const dirContents = fsSearch(fs, path);

        Object.keys(dirContents).forEach((name) => {
            const fullPath = path === "/" ? `/${name}` : `${path}/${name}`;
            results.push(fullPath);

            if (dirContents[name].type === "d") {
                findInDirectory(fs, fullPath, results);
            }
        });
    } catch (err) {
    }

    return results;
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    try {
        const searchPath = argv.length > 0 ? relativeToAbsolutePath(state, argv[0]) : state.getEnvVariables().cwd;
        const results = findInDirectory(state.getFileSystem(), searchPath);

        return { output: results.join("\n") };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     find -- walk a file hierarchy

SYNOPSIS
     find [path]

DESCRIPTION
     The find utility recursively descends the directory tree for the given
     path (or current directory if not specified), listing all files and
     directories found.`;

export default { optDef, functionDef };
