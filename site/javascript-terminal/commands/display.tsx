import { Box } from "@mui/material";

import { parseOptions } from "../parser";
import type EmulatorState from "../emulatorState/EmulatorState";
import { relativeToAbsolutePath } from "../emulatorState/EmulatorState";
import * as FileOp from "../fs/operations/fileOperations";
import type { FileSystem } from "../../FileSystem";

const fileToImageOutput = (fs: FileSystem, filePath: string) => {
    const file = FileOp.read(fs, filePath);

    let jsxElement = (
        <Box
            component="img"
            alt={"Image"}
            src={file}
            sx={{ width: "auto", height: 360, padding: "10px" }}
        />
    );

    if (filePath.match(new RegExp(".(mov|mp4)$", "g"))) {
        jsxElement = (
            <Box
                component="iframe"
                width="640"
                height="360"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share"
                src={file}
                sx={{ border: 0, padding: "10px" }}
            />
        );
    }

    return jsxElement;
};

export const optDef = {};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: display [file ...]", type: "error" };
    }

    const regex = new RegExp(".(png|jpe?g|mov|mp4)$", "g");
    const filePaths = argv
        .map((pathArg) => relativeToAbsolutePath(state, pathArg))
        .filter((item) => item.match(regex));

    return {
        output: filePaths.map((path) => fileToImageOutput(state.getFileSystem(), path)),
        type: "react"
    };
};

export const manPage = `NAME
     display -- display image and video files

SYNOPSIS
     display [file ...]

DESCRIPTION
     Views files sequentially, writing them to the standard output.`;
