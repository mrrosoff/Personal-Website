import commands from "../commands.js";

export const create = (commandMapping = commands): any => {
	for (const [commandName, command] of Object.entries(commandMapping) as any) {
		if (!command.functionDef || !command.optDef) {
			throw Error(`Failed To Initialize Terminal: Invalid Command (${commandName})`);
		}
	}
	return commandMapping;
};

export const isCommandSet = (commandMapping = commands, commandName: string) => {
    return commandName in commandMapping;
};

export const getCommandFn = (commandMapping = commands, commandName: string) => {
	if (commandName in commandMapping) {
		return commandMapping[commandName].functionDef;
	}
	return undefined;
};

export const getCommandOptDef = (commandMapping = commands, commandName: string) => {
    if (commandName in commandMapping) {
        return commandMapping[commandName].optDef;
    }
    return undefined;
};

export const getCommandNames = (commandMapping = commands) => {
	return Object.keys(commandMapping);
};

export default { create, isCommandSet, getCommandFn, getCommandOptDef, getCommandNames };
