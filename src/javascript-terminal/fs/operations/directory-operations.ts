import * as BaseOp from "./base-operations";
import { fsSearch, fsSearchParent } from "./base-operations";
import { getLastPathPart } from "../util/path-util";

export const list = (fs, path) => {
	return Object.keys(fsSearch(fs, path));
};

export const add = (fs, path, dir) => {
	BaseOp.add(fs, path, dir);
};

export const copy = (fs, srcPath, destPath) => {
	const fsPart = fsSearchParent(fs, srcPath);
	fsPart[getLastPathPart(destPath)] = fsPart[getLastPathPart(srcPath)];
};

export const remove = (fs, path) => {
	return BaseOp.remove(fs, path);
};

export const rename = (fs, currentPath, newPath) => {
	copy(fs, currentPath, newPath);
	remove(fs, currentPath);
};
