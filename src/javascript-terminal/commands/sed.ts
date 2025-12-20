import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length < 2) {
        return { output: "sed: missing operand", type: "error" };
    }

    try {
        const command = argv[0];
        const filePath = relativeToAbsolutePath(state, argv[1]);
        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        const sedMatch = command.match(/^s\/(.+)\/(.*)\/([g]?)$/);

        if (!sedMatch) {
            return {
                output: "sed: invalid command. Use format: s/find/replace/ or s/find/replace/g",
                type: "error"
            };
        }

        const [, findPattern, replacePattern, globalFlag] = sedMatch;

        let output: string;
        if (globalFlag === "g") {
            const regex = new RegExp(findPattern, "g");
            output = fileContent.replace(regex, replacePattern);
        } else {
            output = fileContent
                .split("\n")
                .map((line: string) => line.replace(new RegExp(findPattern), replacePattern))
                .join("\n");
        }

        return { output };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     sed -- stream editor for filtering and transforming text

SYNOPSIS
     sed 's/pattern/replacement/[g]' file

DESCRIPTION
     The sed utility reads the specified file and applies the given editing
     command to it. The basic substitution command has the format:

     s/pattern/replacement/    - replace first match on each line
     s/pattern/replacement/g   - replace all matches (global)

     The pattern can be a regular expression, and the replacement is the
     text to substitute in place of matches.`;

export default { optDef, functionDef };
