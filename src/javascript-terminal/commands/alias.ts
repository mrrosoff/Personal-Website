import { parseOptions } from "../parser";
import EmulatorState from "../emulator-state/EmulatorState";
import { errorMessage } from "../emulator-state/CommandMapping";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    const envVariables = state.getEnvVariables();
    const aliases: Record<string, string | undefined> = {};

    Object.entries(envVariables).forEach(([key, value]) => {
        if (key.startsWith("alias_")) {
            aliases[key.slice(6)] = value;
        }
    });

    if (argv.length === 0) {
        if (Object.keys(aliases).length === 0) {
            return { output: "" };
        }

        return {
            output: Object.entries(aliases)
                .map(([name, command]) => `alias ${name}='${command}'`)
                .join("\n")
        };
    }

    try {
        const input = argv.join(" ");
        const match = input.match(/^(\w+)=['"](.+)['"]$/);

        if (!match) {
            return {
                output: "alias: invalid syntax. Use: alias name='command'",
                type: "error"
            };
        }

        const [, aliasName, aliasCommand] = match;

        state.setEnvVariables({
            ...envVariables,
            [`alias_${aliasName}`]: aliasCommand
        });

        return { output: "" };
    } catch (err: unknown) {
        return { output: errorMessage(err), type: "error" };
    }
};

export const manPage = `NAME
     alias -- create command aliases

SYNOPSIS
     alias [name='command']

DESCRIPTION
     The alias utility creates shortcuts for commands. When called without
     arguments, it displays all current aliases. To create an alias, use the
     format: alias name='command' (e.g., alias ll='ls -la').

     Note: Aliases are stored in environment variables and persist for the
     session.`;

export default { optDef, functionDef };
