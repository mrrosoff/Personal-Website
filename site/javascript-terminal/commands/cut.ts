import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as FileOp from "../fs/operations/fileOperations";

export const optDef = {
    "-d, --delimiter": "<delim>",
    "-f, --fields": "<list>"
};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "cut: missing file operand", type: "error" };
    }

    const filePath = relativeToAbsolutePath(state, argv[0]);
    const fileContent = FileOp.read(state.getFileSystem(), filePath);

    const delimiter = String(options.delimiter ?? "\t");
    const fields = options.fields;

    if (!fields) {
        return { output: "cut: you must specify a list of fields with -f", type: "error" };
    }

    const fieldNumbers: number[] = [];
    const fieldSpec = String(fields);

    if (fieldSpec.includes("-")) {
        const [start, end] = fieldSpec.split("-").map(Number);
        for (let i = start; i <= end; i++) {
            fieldNumbers.push(i);
        }
    } else if (fieldSpec.includes(",")) {
        fieldNumbers.push(...fieldSpec.split(",").map(Number));
    } else {
        fieldNumbers.push(Number(fieldSpec));
    }

    const lines = fileContent.split("\n");
    const output = lines
        .map((line: string) => {
            const parts = line.split(delimiter);
            return fieldNumbers.map((fieldNum) => parts[fieldNum - 1] || "").join(delimiter);
        })
        .join("\n");

    return { output };
};

export const manPage = `NAME
     cut -- extract columns from files

SYNOPSIS
     cut -f fields [-d delimiter] file

DESCRIPTION
     The cut utility extracts portions of each line from a file. The -f option
     specifies which fields to extract (1-indexed), and -d specifies the
     delimiter (default is tab).

     Field specifications:
       -f 1        Extract first field
       -f 1,3      Extract fields 1 and 3
       -f 1-3      Extract fields 1 through 3

     Example: cut -d ',' -f 1,2 data.csv`;
