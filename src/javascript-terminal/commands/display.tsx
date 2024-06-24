import { parseOptions } from "../parser";
import { relativeToAbsolutePath } from "../emulator-state/EmulatorState";
import * as FileOp from "../fs/operations/file-operations";

const fileToImageOutput = (fs: any, filePath: string) => {
    const file = FileOp.read(fs, filePath);

    let jsxElement = (
        <img alt={"Image"} src={file} style={{ width: "auto", height: 360, padding: 10 }} />
    );

    if (filePath.match(new RegExp(".(mov|mp4)$", "g"))) {
        jsxElement = (
            <iframe
                width="640"
                height="360"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share"
                src={file}
                style={{ border: 0, padding: 10 }}
            />
        );
    }

    return jsxElement;
};

export const optDef = {};

const functionDef = (state: { getFileSystem: () => any }, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    try {
        const regex = new RegExp(".(png|jpe?g|mov|mp4)$", "g");
        const filePaths = argv
            .map((pathArg) => relativeToAbsolutePath(state, pathArg))
            .filter((item) => item.match(regex));

        return {
            output: filePaths.map((path) => fileToImageOutput(state.getFileSystem(), path)),
            type: "react"
        };
    } catch (err: any) {
        return { output: err.message, type: "error" };
    }
};

export default { optDef, functionDef };
