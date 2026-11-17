import { parseCommands } from "../parser";
import { suggestCommandOptions, suggestCommands, suggestFileSystemNames } from "./auto-complete";
import * as CommandMappingUtil from "../emulator-state/CommandMapping";
import { errorMessage } from "../emulator-state/CommandMapping";
import * as PathUtil from "../fs/util/path-util";
import { fsSearchParent } from "../fs/operations/base-operations";
import EmulatorState from "../emulator-state/EmulatorState";
import type { CommandMapping, CommandResult } from "../emulator-state/CommandMapping";

export default class Emulator {
    autocomplete(state: EmulatorState, partialStr: string) {
        try {
            const suggestions = this.suggest(state, partialStr);
            if (suggestions.length === 0) {
                return partialStr;
            }

            if (suggestions.length > 1) {
                if (state.getTabCount() === 0) {
                    state.setTabCount(state.getTabCount() + 1);
                } else {
                    this.addCommandToHistory(state, "");
                    this.addCommandOutput(state, [{ output: suggestions.join(" ") }]);
                }
                return partialStr;
            } else {
                state.setTabCount(0);
            }

            const strParts = partialStr.split(" ");
            strParts[strParts.length - 1] = suggestions[0];
            return strParts.join(" ");
        } catch (err) {
            return partialStr;
        }
    }

    suggest(state: EmulatorState, partialStr: string) {
        partialStr = partialStr.replace(/^\s+/g, "");

        const lastPartialChar = partialStr.slice(-1);
        const isTypingNewPart = lastPartialChar === " ";

        const strParts = partialStr.trim().split(" ");

        const cmdName = strParts[0];
        const lastTextEntered = strParts[strParts.length - 1];

        if (!isTypingNewPart && strParts.length === 1) {
            return suggestCommands(state.getCommandMapping(), cmdName);
        }

        const strToComplete = isTypingNewPart ? "" : lastTextEntered;
        const cwd = state.getEnvVariables().cwd!;

        if (
            strToComplete !== "" &&
            !strToComplete.endsWith("/") &&
            Object.keys(
                fsSearchParent(state.getFileSystem(), PathUtil.toAbsolutePath(strToComplete, cwd))
            ).includes(PathUtil.getLastPathPart(PathUtil.toAbsolutePath(strToComplete, cwd)))
        ) {
            throw Error("Already Completed Path");
        }

        return [
            ...suggestCommandOptions(state.getCommandMapping(), cmdName, strToComplete),
            ...suggestFileSystemNames(state.getFileSystem(), cwd, strToComplete)
        ];
    }

    execute(state: EmulatorState, str: string, errorString: string) {
        this.addCommandToHistory(state, str);

        if (str.trim() === "") {
            this.addCommandOutput(state, [{ output: "" }]);
        } else {
            this.updateStateByExecution(state, str, errorString);
        }

        state.setTabCount(0);
        return state;
    }

    updateStateByExecution(state: EmulatorState, commandStrToExecute: string, errorString: string) {
        const commandResults = [];

        for (const { commandName, commandOptions } of parseCommands(commandStrToExecute)) {
            const commandMapping = state.getCommandMapping();
            const {
                output,
                type = "output",
                oldCwdPath
            } = this.runCommand(commandMapping, commandName, state, commandOptions, errorString);

            if (output instanceof Array) {
                output.forEach((outputItem) => {
                    const lastCwd = oldCwdPath ? oldCwdPath : "/";
                    commandResults.push({
                        state,
                        output: { output: outputItem, type, oldCwdPath },
                        cwd: type === "cwd" ? lastCwd : undefined
                    });
                });
            } else if (output || output === "") {
                const lastCwd = oldCwdPath ? oldCwdPath : "/";
                commandResults.push({
                    state,
                    output: { output, type, oldCwdPath },
                    cwd: type === "cwd" ? lastCwd : undefined
                });
            }
        }

        if (commandResults.length) {
            this.addCommandOutput(
                commandResults[commandResults.length - 1].state,
                commandResults.map((elem) => elem.output),
                commandResults[commandResults.length - 1].cwd
            );
        }
    }

    addCommandToHistory(state: EmulatorState, command: string) {
        state.setHistory([...state.getHistory(), command]);
    }

    addCommandOutput(
        state: EmulatorState,
        outputs: CommandResult[],
        cwd = state.getEnvVariables().cwd
    ) {
        state.setOutputs([
            ...state.getOutputs(),
            {
                output: outputs,
                command: state.getHistory()[state.getHistory().length - 1],
                cwd: cwd
            }
        ]);
    }

    runCommand(
        commandMapping: CommandMapping,
        commandName: string,
        state: EmulatorState,
        commandOptions: string[],
        errorString = "Command Not Found"
    ): CommandResult {
        const command = CommandMappingUtil.getCommandFn(commandMapping, commandName);
        if (!command) {
            return { output: errorString, type: "error" };
        }

        try {
            return command(state, commandOptions);
        } catch (err: unknown) {
            return { output: errorMessage(err), type: "error" };
        }
    }
}
