import { UserType } from "../../../api/types";
import { decodeToken } from "../../auth";
import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: su <user>", type: "error" };
    }

    const environmentVariables = state.getEnvVariables();
    const token = environmentVariables["AUTH_TOKEN"];
    if (!token) {
        return { output: "Permission Denied", type: "error" };
    }

    const payload = decodeToken(token);
    const allowedUserTypes = [
        UserType.ADMIN,
        UserType.FRIEND,
        UserType.SPOTIFY_OWNER,
        UserType.POLAROID_OWNER
    ];
    if (!payload || !allowedUserTypes.includes(payload.userType)) {
        return { output: "Permission Denied", type: "error" };
    }

    const targetUser = argv.join(" ");
    if (targetUser.toLowerCase() !== payload.id.toLowerCase()) {
        return { output: `Unknown User "${targetUser}"`, type: "error" };
    }

    if (payload.userType !== UserType.ADMIN) {
        state.setPasswordPromptState({});
    }

    return { output: "", type: "text" };
};

export const manPage = `NAME
     su -- switch user

SYNOPSIS
     sudo su <user>

DESCRIPTION
     Switch to the specified user. Must be invoked via sudo.`;

export default { optDef, functionDef };
