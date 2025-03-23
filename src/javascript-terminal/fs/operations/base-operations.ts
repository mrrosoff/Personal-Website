import { getLastPathPart, toPathParts } from "../util/path-util";
import { File, FileSystem } from "../../../FileSystem";

export const fsSearchParent = (fs, path: string) => {
    let fsSection = fs;
    let pathParts = toPathParts(path);

    for (const pathPart of pathParts.slice(0, pathParts.length - 1)) {
        if (!fsSection[pathPart]) {
            return fsSection;
        }

        fsSection = fsSection[pathPart].contents;
    }

    return fsSection;
};

export const fsSearchAutoComplete = (fs, path: string) => {
    let fsSection = fs;
    let pathParts = toPathParts(path);

    for (const pathPart of pathParts) {
        if (!fsSection[pathPart]) {
            return fsSection;
        }

        fsSection = fsSection[pathPart].contents;
    }

    return fsSection;
};

export const fsSearch = (fs, path: string) => {
    let fsSection = fs;
    let pathParts = toPathParts(path);

    for (const pathPart of pathParts) {
        if (!fsSection[pathPart]) {
            throw Error("Specified Path Not In Filesystem");
        }

        fsSection = fsSection[pathPart].contents;
    }

    return fsSection;
};

export const add = (fs, pathToAdd: string, fsElementToAdd) => {
    fsSearchAutoComplete(fs, pathToAdd)[getLastPathPart(pathToAdd)] = fsElementToAdd;
};

export const remove = (fs, pathToRemove: string) => {
    delete fsSearchParent(fs, pathToRemove)[getLastPathPart(pathToRemove)];
};
