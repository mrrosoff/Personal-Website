import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState, { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";
import { FileSystem } from "../../FileSystem";

const fileToAudioOutput = (fs: FileSystem, filePath: string) => {
    const file = FileOp.read(fs, filePath);

    return (
        <iframe
            width="640"
            height="360"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share"
            src={file}
            style={{ border: 0, padding: 10 }}
        />
    );
};

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: play [file ...]", type: "error" };
    }

    try {
        const regex = new RegExp(".(mp3|wav|ogg|flac|aac|mov|mp4|mkv|avi)$", "g");
        const filePaths = argv
            .map((pathArg) => relativeToAbsolutePath(state, pathArg))
            .filter((item) => item.match(regex));

        if (filePaths.length === 0) {
            return { output: "No Supported Audio Files Found", type: "error" };
        }

        return {
            output: filePaths.map((path) => fileToAudioOutput(state.getFileSystem(), path)),
            type: "react"
        };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     play -- play audio and video files

SYNOPSIS
     play [file ...]

DESCRIPTION
     Plays audio and video files. Supported formats: mp3, wav, ogg, flac,
     aac, mov, mp4, mkv, avi.`;

export default { optDef, functionDef, manPage };
