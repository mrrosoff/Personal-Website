import { File } from "../../../FileSystem";

export function isFile(obj: File): boolean {
    return obj.type === "-";
}

export function isDirectory(obj: File): boolean {
    return obj.type === "d";
}

export function isSymbolicLink(obj: File): boolean {
    return obj.type === "l";
}

export function makeEmptyFile(): File {
    return { type: "-", permissions: "rwx------", contents: "" };
}

export function makeEmptyDirectory(): File {
    return { type: "d", permissions: "rwx------", contents: {} };
}

export default {
    isFile,
    isDirectory,
    isSymbolicLink,
    makeEmptyFile,
    makeEmptyDirectory
};
