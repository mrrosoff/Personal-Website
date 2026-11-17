import axios from "axios";

import { API_ENDPOINT_URL, UserType } from "../../../api/types";
import { decodeToken } from "../../auth";
import type EmulatorState from "../emulatorState/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

export const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: flavor <flavor name>", type: "error" };
    }

    const token = state.getEnvVariables().AUTH_TOKEN;
    if (!token) {
        return { output: "Permission Denied", type: "error" };
    }

    const payload = decodeToken(token);
    const allowedUserTypes = [UserType.ADMIN, UserType.FRIEND];
    if (!payload || !allowedUserTypes.includes(payload.userType)) {
        return { output: "Permission Denied", type: "error" };
    }

    const flavorName = argv.join(" ");
    void axios.post(
        `${API_ENDPOINT_URL}/friends/suggest-flavor`,
        { flavor: flavorName },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return { output: "Flavor Suggestion Sent" };
};

export const manPage = `NAME
     flavor -- suggest a new ice cream flavor

SYNOPSIS
     sudo flavor <flavor name>

DESCRIPTION
     Suggest a new ice cream flavor. Must be authenticated as a friend via sudo.`;
