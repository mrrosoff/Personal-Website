import { create as createCommandMapping } from "./CommandMapping";
import * as FileUtil from "../fs/util/file-util";
import * as PathUtil from "../fs/util/path-util";

const TAB_COUNT_KEY = "tabCount";
const FS_KEY = "fs";
const ENVIRONMENT_VARIABLES_KEY = "environmentVariables";
const HISTORY_KEY = "history";
const OUTPUTS_KEY = "outputs";
const COMMAND_MAPPING_KEY = "commandMapping";

type EmulatorStateType = {
    [TAB_COUNT_KEY]?: number;
    [FS_KEY]?: any;
    [ENVIRONMENT_VARIABLES_KEY]?: any;
    [HISTORY_KEY]?: any;
    [OUTPUTS_KEY]?: any;
    [COMMAND_MAPPING_KEY]?: any;
};

export default class EmulatorState {
    private state: EmulatorStateType;

    constructor(state: EmulatorStateType) {
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
    }: EmulatorStateType) {
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

    getTabCount(): number {
        return this.state[TAB_COUNT_KEY] || 0;
    }

    setTabCount(newTabCount: number) {
        this.state[TAB_COUNT_KEY] = newTabCount;
    }

    getFileSystem() {
        return this.state[FS_KEY];
    }

    setFileSystem(newFileSystem: any) {
        this.state[FS_KEY] = newFileSystem;
    }

    getEnvVariables() {
        return this.state[ENVIRONMENT_VARIABLES_KEY];
    }

    setEnvVariables(newEnvVariables: any) {
        this.state[ENVIRONMENT_VARIABLES_KEY] = newEnvVariables;
    }

    getHistory() {
        return this.state[HISTORY_KEY];
    }

    setHistory(newHistory: any) {
        this.state[HISTORY_KEY] = newHistory;
    }

    getOutputs() {
        return this.state[OUTPUTS_KEY];
    }

    setOutputs(newOutputs: any) {
        this.state[OUTPUTS_KEY] = newOutputs;
    }

    getCommandMapping() {
        return this.state[COMMAND_MAPPING_KEY];
    }

    setCommandMapping(newCommandMapping: any) {
        this.state[COMMAND_MAPPING_KEY] = newCommandMapping;
    }
}

export const relativeToAbsolutePath = (state: any, path: string) => {
    return PathUtil.toAbsolutePath(path, state.getEnvVariables().cwd);
};
