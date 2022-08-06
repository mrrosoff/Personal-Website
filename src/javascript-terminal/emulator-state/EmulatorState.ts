import { create as createCommandMapping } from "./CommandMapping";
import * as FileUtil from "../fs/util/file-util";
import * as PathUtil from "../fs/util/path-util";

const TAB_COUNT_KEY = "tabCount";
const FS_KEY = "fs";
const ENVIRONMENT_VARIABLES_KEY = "environmentVariables";
const HISTORY_KEY = "history";
const OUTPUTS_KEY = "outputs";
const COMMAND_MAPPING_KEY = "commandMapping";

export default class EmulatorState {
	constructor(state) {
		if (!state) throw Error("Do Not Use Constructor Directly. Use create Method");
		this.state = state;
	}

	static create({
		tabCount = 0,
		fs = { "/": FileUtil.makeEmptyDirectory() },
		environmentVariables = { cwd: "/" },
		history = [],
		outputs = [],
		commandMapping = createCommandMapping()
	}) {
		const stateMap = {
			[TAB_COUNT_KEY]: tabCount,
			[FS_KEY]: fs,
			[ENVIRONMENT_VARIABLES_KEY]: environmentVariables,
			[HISTORY_KEY]: history,
			[OUTPUTS_KEY]: outputs,
			[COMMAND_MAPPING_KEY]: commandMapping
		};

		return new EmulatorState(stateMap);
	}

	getTabCount() {
		return this.state[TAB_COUNT_KEY];
	}

	setTabCount(newTabCount) {
		this.state[TAB_COUNT_KEY] = newTabCount;
	}

	getFileSystem() {
		return this.state[FS_KEY];
	}

	setFileSystem(newFileSystem) {
		this.state[FS_KEY] = newFileSystem;
	}

	getEnvVariables() {
		return this.state[ENVIRONMENT_VARIABLES_KEY];
	}

	setEnvVariables(newEnvVariables) {
		this.state[ENVIRONMENT_VARIABLES_KEY] = newEnvVariables;
	}

	getHistory() {
		return this.state[HISTORY_KEY];
	}

	setHistory(newHistory) {
		this.state[HISTORY_KEY] = newHistory;
	}

	getOutputs() {
		return this.state[OUTPUTS_KEY];
	}

	setOutputs(newOutputs) {
		this.state[OUTPUTS_KEY] = newOutputs;
	}

	getCommandMapping() {
		return this.state[COMMAND_MAPPING_KEY];
	}

	setCommandMapping(newCommandMapping) {
		this.state[COMMAND_MAPPING_KEY] = newCommandMapping;
	}
}

export const relativeToAbsolutePath = (state, path) => {
	return PathUtil.toAbsolutePath(path, state.getEnvVariables().cwd);
};
