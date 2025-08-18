import { JSX } from "react";
import commands from "../commands.js";
import EmulatorState from "./EmulatorState.js";

export type CommandMapping = {
    [key: string]: {
        functionDef: (
            state: EmulatorState,
            _commandOptions: string[]
        ) => { output?: JSX.Element | JSX.Element[] | string; type?: string };
        optDef: { [key: string]: string };
    };
};

export const create = (commandMapping: CommandMapping = commands): CommandMapping => {
    for (const [commandName, command] of Object.entries(commandMapping)) {
        if (!command.functionDef || !command.optDef) {
            throw Error(`Failed To Initialize Terminal: Invalid Command (${commandName})`);
        }
    }
    return commandMapping;
};

export const isCommandSet = (commandMapping: CommandMapping = commands, commandName: string) => {
    return commandName in commandMapping;
};

export const getCommandFn = (commandMapping: CommandMapping = commands, commandName: string) => {
    if (commandName in commandMapping) {
        return commandMapping[commandName].functionDef;
    }
    return undefined;
};

export const getCommandOptDef = (
    commandMapping: CommandMapping = commands,
    commandName: string
): Record<string, string> | undefined => {
    if (commandName in commandMapping) {
        return commandMapping[commandName].optDef;
    }
    return undefined;
};

export const getCommandNames = (commandMapping: CommandMapping = commands) => {
    return Object.keys(commandMapping);
};

export default {
    create,
    isCommandSet,
    getCommandFn,
    getCommandOptDef,
    getCommandNames
};
