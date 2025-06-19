import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = { "-r, --recursive": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return {};
    }

    try {
        const srcPath = relativeToAbsolutePath(state, argv[0]);
        const destPath = relativeToAbsolutePath(state, argv[1]);

        if (srcPath === destPath) {
            return { output: "Source and destination are the same (not copied)." };
        }

        if (options.recursive) {
            DirOp.copy(state.getFileSystem(), srcPath, destPath);
        } else {
            FileOp.copy(state.getFileSystem(), srcPath, destPath);
        }

        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
