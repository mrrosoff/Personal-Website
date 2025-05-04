import * as BaseOp from "./base-operations";
import { fsSearch, fsSearchParent } from "./base-operations";
import { getLastPathPart } from "../util/path-util";
import { FileSystem } from "../../../FileSystem";

export const list = (fs: FileSystem, path: string) => {
    return Object.keys(fsSearch(fs, path));
};

export const add = (fs: FileSystem, path: string, dir: any) => {
    BaseOp.add(fs, path, dir);
};

export const copy = (fs: FileSystem, srcPath: string, destPath: string) => {
    const fsPart = fsSearchParent(fs, srcPath);
    fsPart[getLastPathPart(destPath)] = fsPart[getLastPathPart(srcPath)];
};

export const remove = (fs: FileSystem, path: string) => {
    return BaseOp.remove(fs, path);
};

export const rename = (fs: FileSystem, currentPath: string, newPath: string) => {
    copy(fs, currentPath, newPath);
    remove(fs, currentPath);
};
