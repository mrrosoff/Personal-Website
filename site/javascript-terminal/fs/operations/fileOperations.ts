import * as BaseOp from "./baseOperations";
import { fsSearchParent } from "./baseOperations";
import { getLastPathPart } from "../util/pathUtil";
import type { File, FileSystem } from "../../../FileSystem";

export const read = (fs: FileSystem, path: string): string => {
    const fsPart = fsSearchParent(fs, path);
    const file = fsPart[getLastPathPart(path)];

    if (file?.type !== "-") {
        throw Error("Not A File At Specified Path: " + path);
    }

    return file.contents;
};

export const write = (fs: FileSystem, path: string, file: File) => BaseOp.add(fs, path, file);

export const copy = (fs: FileSystem, srcPath: string, destPath: string) => {
    const fsPart = fsSearchParent(fs, srcPath);

    if (fsPart[getLastPathPart(srcPath)]?.type !== "-") {
        throw Error("Not A File At Specified Path: " + srcPath);
    }

    fsPart[getLastPathPart(destPath)] = fsPart[getLastPathPart(srcPath)];
};

export const remove = (fs: FileSystem, path: string) => {
    const fsPart = fsSearchParent(fs, path);

    if (fsPart[getLastPathPart(path)]?.type !== "-") {
        throw Error("Not A File At Specified Path: " + path);
    }

    BaseOp.remove(fs, path);
};

export const rename = (fs: FileSystem, currentPath: string, newPath: string) => {
    copy(fs, currentPath, newPath);
    remove(fs, currentPath);
};
