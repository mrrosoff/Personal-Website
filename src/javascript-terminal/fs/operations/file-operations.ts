import * as BaseOp from "./base-operations";
import { fsSearchParent } from "./base-operations";
import { getLastPathPart } from "../util/path-util";

export const read = (fs, path) => {
	const fsPart = fsSearchParent(fs, path);

	if (!fsPart[getLastPathPart(path)] || fsPart[getLastPathPart(path)].type !== "-") {
		throw Error("Not A File At Specified Path: " + path);
	}

	return fsPart[getLastPathPart(path)].contents;
};

export const write = (fs, path, file) => {
	BaseOp.add(fs, path, file);
};

export const copy = (fs, srcPath, destPath) => {
	const fsPart = fsSearchParent(fs, srcPath);

	console.log(fsPart);

	if (!fsPart[getLastPathPart(srcPath)] || fsPart[getLastPathPart(srcPath)].type !== "-") {
		throw Error("Not A File At Specified Path: " + srcPath);
	}

	fsPart[getLastPathPart(destPath)] = fsPart[getLastPathPart(srcPath)];
};

export const remove = (fs, path) => {
	const fsPart = fsSearchParent(fs, path);

	if (!fsPart[getLastPathPart(path)] || fsPart[getLastPathPart(path)].type !== "-") {
		throw Error("Not A File At Specified Path: " + path);
	}

	return BaseOp.remove(fs, path);
};

export const rename = (fs, currentPath, newPath) => {
	copy(fs, currentPath, newPath);
	remove(fs, currentPath);
};
