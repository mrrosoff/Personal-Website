import getOpts from "get-options";

export const parseOptions = (commandOptions: string[], optDef: string | Record<string, string>) =>
    getOpts(commandOptions, optDef, { noAliasPropagation: "first-only" });

const removeExcessWhiteSpace = (str: string) => str.trim().replace(/\s\s+/g, " ");
const toCommandParts = (command: string) => removeExcessWhiteSpace(command).split(/\s/);

export const parseCommands = (commands: string) => {
	return commands
		.split(/&&|;/)
		.map((command) => toCommandParts(command))
		.map(([commandName, ...commandOptions]) => ({
			commandName,
			commandOptions
		}));
};
