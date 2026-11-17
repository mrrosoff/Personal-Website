import type { JSX } from "react";
import commands from "../commands";
import type EmulatorState from "./EmulatorState";

export type CommandResult = {
    output?: JSX.Element | JSX.Element[] | string;
    type?: string;
    oldCwdPath?: string;
};

export type CommandMapping = Partial<
    Record<
        string,
        {
            functionDef: (state: EmulatorState, _commandOptions: string[]) => CommandResult;
            optDef: Record<string, string>;
            manPage?: string;
        }
    >
>;

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

export const isCommandSet = (commandMapping: CommandMapping = commands, commandName: string) => {
    return commandName in commandMapping;
};

export const getCommandFn = (commandMapping: CommandMapping = commands, commandName: string) => {
    return commandMapping[commandName]?.functionDef;
};

export const getCommandOptDef = (
    commandMapping: CommandMapping = commands,
    commandName: string
): Record<string, string> | undefined => {
    return commandMapping[commandName]?.optDef;
};

export const getCommandNames = (commandMapping: CommandMapping = commands) => {
    return Object.keys(commandMapping);
};

export default {
    isCommandSet,
    getCommandFn,
    getCommandOptDef,
    getCommandNames
};
