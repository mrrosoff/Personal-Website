import { getLastPathPart, toPathParts } from "../util/path-util";

export const fsSearchParent = (fs, path) => {
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

export const fsSearchAutoComplete = (fs, path) => {
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

export const fsSearch = (fs, path) => {
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

export const add = (fs, pathToAdd, fsElementToAdd) => {
	fsSearchAutoComplete(fs, pathToAdd)[getLastPathPart(pathToAdd)] = fsElementToAdd;
};

export const remove = (fs, pathToRemove) => {
	delete fsSearchParent(fs, pathToRemove)[getLastPathPart(pathToRemove)];
};
