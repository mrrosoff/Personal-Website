import { parseCommands } from "../parser";
import { suggestCommandOptions, suggestCommands, suggestFileSystemNames } from "./auto-complete";
import * as CommandMappingUtil from "../emulator-state/CommandMapping";
import * as PathUtil from "../fs/util/path-util";
import { fsSearchParent } from "../fs/operations/base-operations";

export default class Emulator {
	autocomplete(state, partialStr) {
		try {
			const suggestions = this.suggest(state, partialStr);
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

	suggest(state, partialStr) {
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
		const cwd = state.getEnvVariables().cwd;

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

	execute(state, str, errorString) {
		this.addCommandToHistory(state, str);

		if (str.trim() === "") {
			this.addCommandOutput(state, [{ output: "" }]);
		} else {
			this.updateStateByExecution(state, str, errorString);
		}

		state.setTabCount(0);
		return state;
	}

	updateStateByExecution(state, commandStrToExecute, errorString) {
		let commandResults = [];

		for (const { commandName, commandOptions } of parseCommands(commandStrToExecute)) {
			const commandMapping = state.getCommandMapping();
			const commandArgs = [state, commandOptions];

			const {
				output: output,
				type: type = "output",
				oldCwdPath
			} = this.runCommand(commandMapping, commandName, commandArgs, errorString);

			if (output || output === "") {
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

	addCommandToHistory(state, command) {
		state.setHistory([...state.getHistory(), command]);
	}

	addCommandOutput(state, outputs, cwd = state.getEnvVariables().cwd) {
		state.setOutputs([
			...state.getOutputs(),
			{
				output: outputs,
				command: state.getHistory()[state.getHistory().length - 1],
				cwd: cwd
			}
		]);
	}

	runCommand(commandMapping, commandName, commandArgs, errorString = "Command not found") {
		const notFoundCallback = () => ({ output: errorString, type: "error" });

		if (!CommandMappingUtil.isCommandSet(commandMapping, commandName)) {
			return notFoundCallback(...commandArgs);
		}

		const command = CommandMappingUtil.getCommandFn(commandMapping, commandName);

		try {
			return command(...commandArgs);
		} catch (fatalCommandError) {
			return { output: "An unknown command error occurred" };
		}
	}
}
