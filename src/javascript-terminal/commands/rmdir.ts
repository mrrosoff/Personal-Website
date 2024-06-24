import { parseOptions } from "../parser";
import { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as DirOp from "../fs/operations/directory-operations";

export const optDef = {};

const functionDef = (state: { getFileSystem: () => any }, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
        const pathToDelete = relativeToAbsolutePath(state, argv[0]);
        DirOp.remove(state.getFileSystem(), pathToDelete);
        return { output: "" };
    } catch (err: any) {
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
