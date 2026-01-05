import { CommandMapping, create as createCommandMapping } from "./CommandMapping";
import * as FileUtil from "../fs/util/file-util";
import * as PathUtil from "../fs/util/path-util";
import { FileSystem } from "../../FileSystem";
import { DatabaseFlavor, FlavorType } from "../../../api/types";

export enum MainMenuOption {
    IceCreamInventory = "IceCreamInventory",
    SendMarketingEmails = "SendMarketingEmails",
    Exit = "Exit"
}

export enum IceCreamInventoryMenuOption {
    ProvisionNewFlavor = "ProvisionNewFlavor",
    ModifyFlavorInventory = "ModifyFlavorInventory",
    GoBack = "GoBack"
}

export enum AdminConsoleScreen {
    Main = "main",
    IceCreamInventory = "ice-cream-inventory",
    SelectFlavor = "select-flavor",
    ConfirmSendEmails = "confirm-send-emails",
    ProvisionFlavorForm = "provision-flavor-form",
    ConfirmProvisionFlavor = "confirm-provision-flavor"
}

export type ProvisionFlavorForm = {
    flavorName: string;
    initialQuantity: number;
    color: string;
    type: FlavorType | null;
    currentField: "flavorName" | "initialQuantity" | "color" | "type";
};

export type AdminConsoleState = {
    screen?: AdminConsoleScreen;
    selectedOption?: MainMenuOption | IceCreamInventoryMenuOption | number | "yes" | "no";
    authToken?: string; // JWT token for API authentication
    inventoryData?: DatabaseFlavor[];
    editingFlavor?: DatabaseFlavor;
    provisionForm?: ProvisionFlavorForm;
    currentPage?: number;
};

export type PasswordPromptState = {
    targetCommand: string;
    targetOptions: string[];
};

const TAB_COUNT_KEY = "tabCount";
const FS_KEY = "fs";
const ENVIRONMENT_VARIABLES_KEY = "environmentVariables";
const HISTORY_KEY = "history";
const OUTPUTS_KEY = "outputs";
const COMMAND_MAPPING_KEY = "commandMapping";
const ADMIN_CONSOLE_KEY = "adminConsole";
const PASSWORD_PROMPT_KEY = "passwordPrompt";

type EmulatorStateType = {
    [TAB_COUNT_KEY]?: number;
    [FS_KEY]: FileSystem;
    [ENVIRONMENT_VARIABLES_KEY]: Record<string, string>;
    [HISTORY_KEY]?: any;
    [OUTPUTS_KEY]?: any;
    [COMMAND_MAPPING_KEY]: CommandMapping;
    [ADMIN_CONSOLE_KEY]?: AdminConsoleState;
    [PASSWORD_PROMPT_KEY]?: PasswordPromptState;
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
    }: Partial<EmulatorStateType>) {
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

    setFileSystem(newFileSystem: FileSystem) {
        this.state[FS_KEY] = newFileSystem;
    }

    getEnvVariables() {
        return this.state[ENVIRONMENT_VARIABLES_KEY];
    }

    setEnvVariables(newEnvVariables: Record<string, string>) {
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

    setCommandMapping(newCommandMapping: CommandMapping) {
        this.state[COMMAND_MAPPING_KEY] = newCommandMapping;
    }

    getAdminConsoleMode(): AdminConsoleState | undefined {
        return this.state[ADMIN_CONSOLE_KEY];
    }

    setAdminConsoleMode(newMode: AdminConsoleState | undefined) {
        this.state[ADMIN_CONSOLE_KEY] = newMode;
    }

    getPasswordPromptState(): PasswordPromptState | undefined {
        return this.state[PASSWORD_PROMPT_KEY];
    }

    setPasswordPromptState(promptState: PasswordPromptState | undefined) {
        this.state[PASSWORD_PROMPT_KEY] = promptState;
    }
}

export const relativeToAbsolutePath = (state: EmulatorState, path: string) => {
    return PathUtil.toAbsolutePath(path, state.getEnvVariables().cwd);
};
