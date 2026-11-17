import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import { fsSearch } from "../fs/operations/baseOperations";
import type { FileSystem } from "../../FileSystem";

export const optDef = {
    "--name": "<pattern>"
};

const findInDirectory = (
    fs: FileSystem,
    path: string,
    namePattern: string | undefined,
    results: string[] = []
): string[] => {
    const dirContents = fsSearch(fs, path);

    Object.entries(dirContents).forEach(([name, file]) => {
        const fullPath = path === "/" ? `/${name}` : `${path}/${name}`;

        let matches = true;
        if (namePattern) {
            const regex = new RegExp(
                "^" +
                    namePattern
                        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
                        .replace(/\*/g, ".*")
                        .replace(/\?/g, ".") +
                    "$"
            );
            matches = regex.test(name);
        }

        if (matches) {
            results.push(fullPath);
        }

        if (file?.type === "d") {
            findInDirectory(fs, fullPath, namePattern, results);
        }
    });

    return results;
};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(
        commandOptions.map((option) => (option === "-name" ? "--name" : option)),
        optDef
    );

    const searchPath =
        argv.length > 0 ? relativeToAbsolutePath(state, argv[0]) : state.getEnvVariables().cwd;
    const namePattern = options.name as string | undefined;
    const results = findInDirectory(state.getFileSystem(), searchPath, namePattern);

    return { output: results.join("\n") };
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
