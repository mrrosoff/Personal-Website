import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { makeEmptyDirectory } from "../fs/util/file-util";
import * as DirOp from "../fs/operations/directory-operations";
import * as PathUtil from "../fs/util/path-util";
import { fsSearchParent } from "../fs/operations/base-operations";
import { getLastPathPart } from "../fs/util/path-util";

export const optDef = { "-p, --parents": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: mkdir [-p] directory_name", type: "error" };
    }

    const newFolderPath = relativeToAbsolutePath(state, argv[0]);

    if (options.parents) {
        const pathParts = PathUtil.toPathParts(newFolderPath);
        let currentPath = "";

        for (const pathPart of pathParts) {
            if (pathPart === "/") {
                currentPath = "/";
                continue;
            }

            currentPath = currentPath === "/" ? `/${pathPart}` : `${currentPath}/${pathPart}`;

            const parent = fsSearchParent(state.getFileSystem(), currentPath);
            const dirName = getLastPathPart(currentPath);

            if (!parent[dirName]) {
                DirOp.add(state.getFileSystem(), currentPath, makeEmptyDirectory());
            }
        }
    } else {
        DirOp.add(state.getFileSystem(), newFolderPath, makeEmptyDirectory());
    }

    return { output: "" };
};

export const manPage = `NAME
     mkdir -- make directories

SYNOPSIS
     mkdir [-p] directory_name

DESCRIPTION
     The mkdir utility creates the directory specified.

OPTIONS
     -p, --parents    Create intermediate directories as required. If this
                      option is not specified, the full path must already exist.`;

export default { optDef, functionDef, manPage };
