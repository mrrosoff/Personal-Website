import { UserType } from "../../../api/types";
import { decodeToken } from "../../components/App";
import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return {};
    }

    const environmentVariables = state.getEnvVariables();
    const token = environmentVariables["AUTH_TOKEN"];
    if (!token) {
        return { output: "Permission Denied", type: "error" };
    }

    const payload = decodeToken(token);
    if (payload?.userType !== UserType.ADMIN) {
        return { output: "Permission Denied", type: "error" };
    }

    const targetUser = argv[0];
    if (targetUser !== payload.id) {
        return { output: `Unknown User "${targetUser}"`, type: "error" };
    }

    state.setPasswordPromptState({});
    return { output: "", type: "text" };
};

export const manPage = `NAME
     su -- switch user

SYNOPSIS
     sudo su <user>

DESCRIPTION
     Switch to the specified user. Must be invoked via sudo.`;

export default { optDef, functionDef };
