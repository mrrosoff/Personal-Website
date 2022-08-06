import getOpts from "get-options";

export const parseOptions = (commandOptions, optDef) =>
	getOpts(commandOptions, optDef, { noAliasPropagation: "first-only" });

const removeExcessWhiteSpace = (str) => str.trim().replace(/\s\s+/g, " ");
const toCommandParts = (command) => removeExcessWhiteSpace(command).split(/\s/);

export const parseCommands = (commands) => {
	return commands
		.split(/&&|;/)
		.map((command) => toCommandParts(command))
		.map(([commandName, ...commandOptions]) => ({
			commandName,
			commandOptions
		}));
};
