import * as PathUtil from "../fs/util/pathUtil";
import { getCommandNames, getCommandOptDef, isCommandSet } from "../emulatorState/CommandMapping";
import type { CommandMapping } from "../emulatorState/CommandMapping";
import { fsSearchAutoComplete } from "../fs/operations/baseOperations";
import type { FileSystem } from "../../FileSystem";

export const suggestCommands = (cmdMapping: CommandMapping, partialStr: string) => {
    const commandNameSeq = getCommandNames(cmdMapping);
    return commandNameSeq.filter((cmd) => cmd.startsWith(partialStr));
};

export const suggestCommandOptions = (
    cmdMapping: CommandMapping,
    commandName: string,
    partialStr: string
) => {
    if (!isCommandSet(cmdMapping, commandName)) {
        return [];
    }

    const optDefSeq = Object.keys(getCommandOptDef(cmdMapping, commandName) ?? {}).flatMap((opts) =>
        opts.split(",").map((opt) => opt.trim())
    );
    return optDefSeq.filter((option) => option.startsWith(partialStr));
};

export const suggestFileSystemNames = (fs: FileSystem, cwd: string, partialStr: string) => {
    const path = PathUtil.toAbsolutePath(partialStr, cwd);
    const fsPart = fsSearchAutoComplete(fs, path);
    return Object.keys(fsPart)
        .filter((suggestion) => {
            if (partialStr.endsWith("/")) return true;
            return (
                PathUtil.getLastPathPart(path, false).toLowerCase() ===
                suggestion.slice(0, PathUtil.getLastPathPart(path, false).length).toLowerCase()
            );
        })
        .map((suggestion) => {
            let pathPrefix = PathUtil.toPathParts(partialStr);
            if (!partialStr.endsWith("/")) {
                pathPrefix = pathPrefix.slice(0, -1);
            }
            const prefix = PathUtil.toPath(pathPrefix);
            if (!prefix) {
                return suggestion;
            }
            return prefix.endsWith("/") ? prefix + suggestion : `${prefix}/${suggestion}`;
        });
};
