import { getLastPathPart, toPathParts } from "../util/pathUtil";
import type { File, FileSystem } from "../../../FileSystem";

const descend = (entry: File): FileSystem => {
    if (entry.type !== "d") {
        throw Error("Cannot Descend Into File");
    }
    return entry.contents;
};

export const fsSearchParent = (fs: FileSystem, path: string): FileSystem => {
    let fsSection: FileSystem = fs;
    const pathParts = toPathParts(path);

    for (const pathPart of pathParts.slice(0, pathParts.length - 1)) {
        if (!fsSection[pathPart]) {
            return fsSection;
        }

        fsSection = descend(fsSection[pathPart]);
    }

    return fsSection;
};

export const fsSearchAutoComplete = (fs: FileSystem, path: string): FileSystem => {
    let fsSection: FileSystem = fs;
    const pathParts = toPathParts(path);

    for (const pathPart of pathParts) {
        if (!fsSection[pathPart]) {
            return fsSection;
        }

        fsSection = descend(fsSection[pathPart]);
    }

    return fsSection;
};

export const fsSearch = (fs: FileSystem, path: string): FileSystem => {
    let fsSection: FileSystem = fs;
    const pathParts = toPathParts(path);

    for (const pathPart of pathParts) {
        if (!fsSection[pathPart]) {
            throw Error("Specified Path Not In Filesystem");
        }

        fsSection = descend(fsSection[pathPart]);
    }

    return fsSection;
};

export const add = (fs: FileSystem, pathToAdd: string, fsElementToAdd: File) => {
    fsSearchAutoComplete(fs, pathToAdd)[getLastPathPart(pathToAdd)] = fsElementToAdd;
};

export const remove = (fs: FileSystem, pathToRemove: string) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete fsSearchParent(fs, pathToRemove)[getLastPathPart(pathToRemove)];
};
