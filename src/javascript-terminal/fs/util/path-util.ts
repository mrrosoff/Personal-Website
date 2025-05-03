export const isTrailingPath = (path: string) => {
    return path.endsWith("/") && path !== "/";
};

export const removeTrailingSeparator = (path: string) => {
    if (path.endsWith("/") && path !== "/") {
        return path.slice(0, -1);
    }
    return path;
};

export const isAbsolutePath = (path: string) => {
    return path.startsWith("/");
};

export const isRelativePath = (path: string) => {
    return !isAbsolutePath(path);
};

export const toPathParts = (path: string, shouldRemoveTrailingSeparator = true) => {
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

export const toPath = (pathParts: string[]) => {
    if (pathParts[0] === "/") {
        return "/" + pathParts.slice(1).join("/");
    }
    return pathParts.join("/");
};

export const getPathParent = (filePath: string) => {
    if (filePath === "/") {
        return "/";
    }
    const pathParts = toPathParts(filePath);
    const pathPartsWithoutFileName = pathParts.slice(0, -1);
    return toPath(pathPartsWithoutFileName);
};

export const getLastPathPart = (filePath: string, shouldRemoveTrailingSeparator = true) => {
    const pathParts = toPathParts(filePath, shouldRemoveTrailingSeparator);
    return pathParts[pathParts.length - 1];
};

export const toAbsolutePath = (relativePath: string, cwd: string) => {
    const GO_UP = "..";
    const CURRENT_DIR = ".";
    const isStackAtRootDirectory = (stack: string[]) => stack.length === 1 && stack[0] === "/";

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
