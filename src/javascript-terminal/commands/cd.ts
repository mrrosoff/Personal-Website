import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { fsSearchParent } from "../fs/operations/base-operations";
import { getLastPathPart } from "../fs/util/path-util";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    try {
        const envVars = state.getEnvVariables();
        const oldCwdPath = envVars.cwd;
        let newCwdPath: string;

        if (argv[0] === "-") {
            const previousDir = envVars.OLDPWD || "/";
            newCwdPath = previousDir;
        } else {
            newCwdPath = argv[0] ? relativeToAbsolutePath(state, argv[0]) : "/";
        }

        const parent = fsSearchParent(state.getFileSystem(), newCwdPath);

        if (!parent[getLastPathPart(newCwdPath)]) {
            throw Error("No Directory At Specified Location");
        }

        if (parent[getLastPathPart(newCwdPath)].type !== "d") {
            throw Error("File At Specified Location");
        }

        state.setEnvVariables({
            ...envVars,
            cwd: newCwdPath,
            OLDPWD: oldCwdPath
        });

        return { output: "", type: "cwd", oldCwdPath: oldCwdPath };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
    cd - Change the shell working directory.

SYNOPSIS
    cd [dir]
    cd -

DESCRIPTION
    Change the shell working directory. If no directory is specified, changes
    to the root directory. The special argument '-' changes to the previous
    working directory (stored in OLDPWD).`;

export default { optDef, functionDef };
