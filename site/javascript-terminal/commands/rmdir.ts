import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as DirOp from "../fs/operations/directoryOperations";
import * as PathUtil from "../fs/util/pathUtil";
import { fsSearchParent } from "../fs/operations/baseOperations";

export const optDef = { "-p, --parents": "" };

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: rmdir [-p] directory", type: "error" };
    }

    const pathToDelete = relativeToAbsolutePath(state, argv[0]);
    DirOp.remove(state.getFileSystem(), pathToDelete);

    if (options.parents) {
        let currentPath = pathToDelete;

        while (currentPath !== "/") {
            const parentPath = PathUtil.getPathParent(currentPath);
            if (parentPath === "/") break;

            try {
                const parent = fsSearchParent(state.getFileSystem(), parentPath);
                const dirName = PathUtil.getLastPathPart(parentPath);
                const dir = parent[dirName];

                if (
                    dir &&
                    typeof dir.contents === "object" &&
                    Object.keys(dir.contents).length === 0
                ) {
                    DirOp.remove(state.getFileSystem(), parentPath);
                    currentPath = parentPath;
                } else {
                    break;
                }
            } catch {
                break;
            }
        }
    }

    return { output: "" };
};

export const manPage = `NAME
     rmdir -- remove directories

SYNOPSIS
     rmdir [-p] directory

DESCRIPTION
     The rmdir utility removes the directory entry specified.

OPTIONS
     -p, --parents    Remove the directory and its ancestors. Each directory
                      argument is treated as a pathname of which all components
                      will be removed, if they are empty, starting with the last
                      component.`;
