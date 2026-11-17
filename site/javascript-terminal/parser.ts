import getOpts from "get-options";

type ParsedOptions = {
    options: Record<string, string | true | undefined>;
    argv: string[];
};

export const parseOptions = (
    commandOptions: string[],
    optDef: string | Record<string, string>
): ParsedOptions => getOpts(commandOptions, optDef, { noAliasPropagation: "first-only" });

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
