import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

export const optDef = {
    "-l, --lines": "",
    "-w, --words": "",
    "-c, --chars": ""
};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
        const filePath = relativeToAbsolutePath(state, argv[0]);
        const fileContent = FileOp.read(state.getFileSystem(), filePath);

        const lines = fileContent.split("\n");
        const words = fileContent.split(/\s+/).filter((w: string) => w.length > 0);
        const chars = fileContent.length;

        const lineCount = lines.length;
        const wordCount = words.length;
        const charCount = chars;

        const hasSpecificFlag = options.lines || options.words || options.chars;

        if (hasSpecificFlag) {
            const counts: string[] = [];
            if (options.lines) counts.push(String(lineCount));
            if (options.words) counts.push(String(wordCount));
            if (options.chars) counts.push(String(charCount));
            return { output: `${counts.join(" ")} ${argv[0]}` };
        }

        return { output: `${lineCount} ${wordCount} ${charCount} ${argv[0]}` };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     wc -- word, line, and byte count

SYNOPSIS
     wc [-lwc] [file]

DESCRIPTION
     The wc utility displays the number of lines, words, and characters
     contained in the specified file.

OPTIONS
     -l, --lines    Display only the line count
     -w, --words    Display only the word count
     -c, --chars    Display only the character count`;

export default { optDef, functionDef };
