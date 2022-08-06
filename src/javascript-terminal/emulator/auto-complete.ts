import * as PathUtil from "../fs/util/path-util";
import { getCommandNames, getCommandOptDef, isCommandSet } from "../emulator-state/CommandMapping";
import { fsSearchAutoComplete } from "../fs/operations/base-operations";

export const suggestCommands = (cmdMapping, partialStr) => {
	const commandNameSeq = getCommandNames(cmdMapping);
	return commandNameSeq.filter((cmd) => partialStr === cmd.substr(0, partialStr.length));
};

export const suggestCommandOptions = (cmdMapping, commandName, partialStr) => {
	if (!isCommandSet(cmdMapping, commandName)) {
		return [];
	}

	const optDefSeq = Object.keys(getCommandOptDef(cmdMapping, commandName)).flatMap((opts) =>
		opts.split(",").map((opt) => opt.trim())
	);
	return optDefSeq.filter((option) => partialStr === option.substr(0, partialStr.length));
};

export const suggestFileSystemNames = (fs, cwd, partialStr) => {
	const path = PathUtil.toAbsolutePath(partialStr, cwd);
	const fsPart = fsSearchAutoComplete(fs, path);
	return Object.keys(fsPart)
		.filter((suggestion) => {
			if (partialStr.endsWith("/")) return true;
			return (
				PathUtil.getLastPathPart(path, false).toLowerCase() ===
				suggestion.substr(0, PathUtil.getLastPathPart(path, false).length).toLowerCase()
			);
		})
		.map((suggestion) => {
			let pathPrefix = PathUtil.toPathParts(partialStr);
			if (!partialStr.endsWith("/")) {
				pathPrefix = pathPrefix.slice(0, -1);
			}
			if (pathPrefix.join("/")) {
				return pathPrefix.join("/") + "/" + suggestion;
			}
			return suggestion;
		});
};
