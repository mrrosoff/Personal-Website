import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import { makeEmptyFile } from "../fs/util/file-util";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        FileOp.write(state.getFileSystem(), filePath, makeEmptyFile());
        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
