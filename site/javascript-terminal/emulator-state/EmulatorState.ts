import type { ReactNode } from "react";

import type { CommandMapping, CommandResult } from "./CommandMapping";
import * as FileUtil from "../fs/util/file-util";
import * as PathUtil from "../fs/util/path-util";
import type { FileSystem } from "../../FileSystem";
import type {
    DatabaseDevice,
    DatabaseFlavor,
    FlavorType,
    MailingListRegistration
} from "../../../api/types";

export enum MainMenuOption {
    IceCreamInventory = "IceCreamInventory",
    SendMarketingEmails = "SendMarketingEmails",
    CreateFriendInvite = "CreateFriendInvite",
    AddMailingListEntry = "AddMailingListEntry",
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
    ConfirmProvisionFlavor = "confirm-provision-flavor",
    CreateFriendInvite = "create-friend-invite",
    AddMailingListEntry = "add-mailing-list-entry"
}

export type EnvironmentVariables = Partial<Record<string, string>> & { cwd: string };

export type EditField = Exclude<keyof DatabaseFlavor, "productId" | "priceId">;

export type ProvisionFlavorForm = {
    flavorName: string;
    initialQuantity: number;
    color: string;
    type: FlavorType | null;
    currentField: "flavorName" | "initialQuantity" | "color" | "type";
};

export type InviteDevice = Pick<DatabaseDevice, "deviceId" | "kind"> & { name: string };

export type FriendInvite = {
    friendName: string;
    email: string;
    durationHours: number;
    deviceIds: string[];
    deviceIndex: number;
    currentField: "friendName" | "email" | "durationHours" | "devices";
    url?: string;
};

export type MailingListEntry = Required<MailingListRegistration> & {
    currentField: keyof MailingListRegistration;
    added?: boolean;
};

export type Marketing = {
    message: string;
};

type AdminConsoleCommon = {
    selectedOption?: MainMenuOption | IceCreamInventoryMenuOption | number | "yes" | "no";
    inventoryData?: DatabaseFlavor[];
    editingFlavor?: DatabaseFlavor;
    editingField?: EditField;
    provisionForm?: ProvisionFlavorForm;
    currentPage?: number;
    loading?: boolean;
    error?: string;
    marketing?: Marketing;
    friendInvite?: FriendInvite;
    inviteDevices?: InviteDevice[];
    mailingListEntry?: MailingListEntry;
};

type AdminConsoleScreenData = {
    [AdminConsoleScreen.ProvisionFlavorForm]: { provisionForm: ProvisionFlavorForm };
    [AdminConsoleScreen.ConfirmProvisionFlavor]: { provisionForm: ProvisionFlavorForm };
    [AdminConsoleScreen.CreateFriendInvite]: { friendInvite: FriendInvite };
    [AdminConsoleScreen.AddMailingListEntry]: { mailingListEntry: MailingListEntry };
};

export type AdminConsoleState = {
    [S in AdminConsoleScreen]: AdminConsoleCommon & {
        screen: S;
    } & (S extends keyof AdminConsoleScreenData ? AdminConsoleScreenData[S] : unknown);
}[AdminConsoleScreen];

export type AdminConsoleMode<S extends AdminConsoleScreen> = Extract<
    AdminConsoleState,
    { screen: S }
>;

export type PasswordPromptState = {
    targetCommand?: string;
    targetOptions?: string[];
    loading?: boolean;
};

export type BlockingModeState = {
    content?: ReactNode;
};

const TAB_COUNT_KEY = "tabCount";
const FS_KEY = "fs";
const ENVIRONMENT_VARIABLES_KEY = "environmentVariables";
const HISTORY_KEY = "history";
const OUTPUTS_KEY = "outputs";
const COMMAND_MAPPING_KEY = "commandMapping";
const ADMIN_CONSOLE_KEY = "adminConsole";
const PASSWORD_PROMPT_KEY = "passwordPrompt";
const BLOCKING_MODE_KEY = "blockingMode";

type EmulatorStateType = {
    [TAB_COUNT_KEY]: number;
    [FS_KEY]: FileSystem;
    [ENVIRONMENT_VARIABLES_KEY]: EnvironmentVariables;
    [HISTORY_KEY]: string[];
    [OUTPUTS_KEY]: {
        command?: string;
        cwd?: string;
        output: CommandResult[];
        promptSymbol?: string;
    }[];
    [COMMAND_MAPPING_KEY]: CommandMapping;
    [ADMIN_CONSOLE_KEY]?: AdminConsoleState;
    [PASSWORD_PROMPT_KEY]?: PasswordPromptState;
    [BLOCKING_MODE_KEY]?: BlockingModeState;
};

export default class EmulatorState {
    private state: EmulatorStateType;

    private constructor(state: EmulatorStateType) {
        this.state = state;
    }

    static create({
        tabCount = 0,
        fs = { "/": FileUtil.makeEmptyDirectory() },
        environmentVariables = { cwd: "/" },
        history = [],
        outputs = [],
        commandMapping = {}
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
        return this.state[TAB_COUNT_KEY];
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

    setEnvVariables(newEnvVariables: EnvironmentVariables) {
        this.state[ENVIRONMENT_VARIABLES_KEY] = newEnvVariables;
    }

    getHistory() {
        return this.state[HISTORY_KEY];
    }

    setHistory(newHistory: EmulatorStateType[typeof HISTORY_KEY]) {
        this.state[HISTORY_KEY] = newHistory;
    }

    getOutputs() {
        return this.state[OUTPUTS_KEY];
    }

    setOutputs(newOutputs: EmulatorStateType[typeof OUTPUTS_KEY]) {
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

    getAdminConsoleModeOn<S extends AdminConsoleScreen>(screen: S): AdminConsoleMode<S> {
        const mode = this.state[ADMIN_CONSOLE_KEY];
        if (mode?.screen !== screen) {
            throw Error(`Admin Console Is Not On The ${screen} Screen`);
        }
        return mode as AdminConsoleMode<S>;
    }

    updateAdminConsoleMode(changes: Partial<AdminConsoleCommon>) {
        const mode = this.state[ADMIN_CONSOLE_KEY];
        if (mode) {
            this.state[ADMIN_CONSOLE_KEY] = { ...mode, ...changes };
        }
    }

    getPasswordPromptState(): PasswordPromptState | undefined {
        return this.state[PASSWORD_PROMPT_KEY];
    }

    setPasswordPromptState(promptState: PasswordPromptState | undefined) {
        this.state[PASSWORD_PROMPT_KEY] = promptState;
    }

    getBlockingMode(): BlockingModeState | undefined {
        return this.state[BLOCKING_MODE_KEY];
    }

    setBlockingMode(blockingMode: BlockingModeState | undefined) {
        this.state[BLOCKING_MODE_KEY] = blockingMode;
    }
}

export const relativeToAbsolutePath = (state: EmulatorState, path: string) => {
    return PathUtil.toAbsolutePath(path, state.getEnvVariables().cwd);
};
