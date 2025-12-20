import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";
import * as PathUtil from "../fs/util/path-util";
import { fsSearchParent } from "../fs/operations/base-operations";

export const optDef = { "-p, --parents": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
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

                    if (dir && typeof dir.contents === "object" && Object.keys(dir.contents).length === 0) {
                        DirOp.remove(state.getFileSystem(), parentPath);
                        currentPath = parentPath;
                    } else {
                        break;
                    }
                } catch (err) {
                    break;
                }
            }
        }

        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
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

export default { optDef, functionDef };
