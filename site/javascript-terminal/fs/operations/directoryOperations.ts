import * as BaseOp from "./baseOperations";
import { fsSearch, fsSearchParent } from "./baseOperations";
import { getLastPathPart } from "../util/pathUtil";
import type { File, FileSystem } from "../../../FileSystem";

export const list = (fs: FileSystem, path: string) => {
    return Object.keys(fsSearch(fs, path));
};

export const add = (fs: FileSystem, path: string, dir: File) => BaseOp.add(fs, path, dir);

export const copy = (fs: FileSystem, srcPath: string, destPath: string) => {
    const fsPart = fsSearchParent(fs, srcPath);
    fsPart[getLastPathPart(destPath)] = fsPart[getLastPathPart(srcPath)];
};

export const remove = (fs: FileSystem, path: string) => BaseOp.remove(fs, path);

export const rename = (fs: FileSystem, currentPath: string, newPath: string) => {
    copy(fs, currentPath, newPath);
    remove(fs, currentPath);
};
