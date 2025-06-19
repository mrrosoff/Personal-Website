import assert from "assert";

import { parseOptions } from "../parser";
import * as PathUtil from "../fs/util/path-util";
import * as DirOp from "../fs/operations/directory-operations";
import EmulatorState from "../emulator-state/EmulatorState";

const IMPLIED_DIRECTORY_ENTRIES = [".", ".."];

const resolveDirectoryToList = (envVariables: { cwd: string }, argv: string | any[]) => {
    const cwd = envVariables.cwd;

    if (argv.length > 0) {
        return PathUtil.toAbsolutePath(argv[0], cwd);
    }

    return cwd;
};

const makeSortedReturn = (listing: string[]) => {
    return { output: listing.sort().join("\n") };
};

export const optDef = { "-a, --all": "", "-A, --almost-all": "" };

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const dirPath = resolveDirectoryToList(state.getEnvVariables(), argv);
        const dirList = DirOp.list(state.getFileSystem(), dirPath);

        if (options.all) {
            return makeSortedReturn(IMPLIED_DIRECTORY_ENTRIES.concat(dirList));
        } else if (options.almostAll) {
            return makeSortedReturn(dirList);
        }

        return makeSortedReturn(dirList.filter((record) => !record.startsWith(".")));
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
