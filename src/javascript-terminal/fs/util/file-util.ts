import { File } from "../../../FileSystem";

export function isFile(obj: any): boolean {
    return obj.type === "-";
}

export function isDirectory(obj: any): boolean {
    return obj.type === "d";
}

export function isSymbolicLink(obj: any): boolean {
    return obj.type === "l";
}

export function makeEmptyFile(): File {
    return { type: "-", permissions: "rwx------", contents: "" };
}

export function makeEmptyDirectory() {
    return { type: "d", permissions: "rwx------", contents: {} };
}

export default {
    isFile,
    isDirectory,
    isSymbolicLink,
    makeEmptyFile,
    makeEmptyDirectory
};
