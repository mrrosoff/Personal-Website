import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { fsSearchParent } from "../fs/operations/base-operations";
import { getLastPathPart } from "../fs/util/path-util";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const oldCwdPath = state.getEnvVariables().cwd;
        const newCwdPath = argv[0] ? relativeToAbsolutePath(state, argv[0]) : "/";
        const parent = fsSearchParent(state.getFileSystem(), newCwdPath);

        if (!parent[getLastPathPart(newCwdPath)]) {
            throw Error("No Directory At Specified Location");
        }

        if (parent[getLastPathPart(newCwdPath)].type !== "d") {
            throw Error("File At Specified Location");
        }

        state.setEnvVariables({ ...state.getEnvVariables(), cwd: newCwdPath });
        return { output: "", type: "cwd", oldCwdPath: oldCwdPath };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
