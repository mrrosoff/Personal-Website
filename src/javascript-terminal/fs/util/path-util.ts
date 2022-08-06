export const isTrailingPath = (path) => {
	return path.endsWith("/") && path !== "/";
};

export const removeTrailingSeparator = (path) => {
	if (path.endsWith("/") && path !== "/") {
		return path.slice(0, -1);
	}
	return path;
};

export const isAbsolutePath = (path) => {
	return path.startsWith("/");
};

export const isRelativePath = (path) => {
	return !isAbsolutePath(path);
};

export const toPathParts = (path, shouldRemoveTrailingSeparator = true) => {
	if (path === "/") {
		return ["/"];
	}

	if (shouldRemoveTrailingSeparator) {
		path = removeTrailingSeparator(path);
	}
	if (isAbsolutePath(path)) {
		return ["/", ...path.split("/").slice(1)];
	}
	return path.split("/");
};

export const toPath = (pathParts) => {
	if (pathParts[0] === "/") {
		return "/" + pathParts.slice(1).join("/");
	}
	return pathParts.join("/");
};

export const getPathParent = (filePath) => {
	if (filePath === "/") {
		return "/";
	}
	const pathParts = toPathParts(filePath);
	const pathPartsWithoutFileName = pathParts.slice(0, -1);
	return toPath(pathPartsWithoutFileName);
};

export const getLastPathPart = (filePath, shouldRemoveTrailingSeparator = true) => {
	const pathParts = toPathParts(filePath, shouldRemoveTrailingSeparator);
	return pathParts[pathParts.length - 1];
};

export const toAbsolutePath = (relativePath, cwd) => {
	const GO_UP = "..";
	const CURRENT_DIR = ".";
	const isStackAtRootDirectory = (stack) => stack.length === 1 && stack[0] === "/";

	relativePath = removeTrailingSeparator(relativePath);
	const pathStack = isAbsolutePath(relativePath) ? [] : toPathParts(cwd);

	for (const pathPart of toPathParts(relativePath)) {
		if (pathPart === GO_UP) {
			if (!isStackAtRootDirectory(pathStack)) {
				pathStack.pop();
			}
		} else if (pathPart !== CURRENT_DIR) {
			pathStack.push(pathPart);
		}
	}

	return toPath(pathStack);
};

export default {
	isTrailingPath,
	removeTrailingSeparator,
	isAbsolutePath,
	isRelativePath,
	toPathParts,
	toPath,
	getPathParent,
	getLastPathPart,
	toAbsolutePath
};
