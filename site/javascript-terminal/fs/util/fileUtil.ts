import type { File } from "../../../FileSystem";

export function isDirectory(obj: File): boolean {
    return obj.type === "d";
}

export function makeEmptyFile(): File {
    return { type: "-", permissions: "rwx------", contents: "" };
}

export function makeEmptyDirectory(): File {
    return { type: "d", permissions: "rwx------", contents: {} };
}
