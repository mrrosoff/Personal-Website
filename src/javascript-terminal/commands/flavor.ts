import axios from "axios";

import { UserType } from "../../../api/types";
import { API_URL, decodeToken } from "../../components/App";
import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length === 0) {
        return { output: "usage: flavor <flavor name>", type: "error" };
    }

    const token = state.getEnvVariables()["AUTH_TOKEN"];
    if (!token) {
        return { output: "Permission Denied", type: "error" };
    }

    const payload = decodeToken(token);
    if (!payload || (payload.userType !== UserType.FRIEND && payload.userType !== UserType.ADMIN)) {
        return { output: "Permission Denied", type: "error" };
    }

    const flavorName = argv.join(" ");
    axios.post(
        `${API_URL}/friends/suggest-flavor`,
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

export default { optDef, functionDef };
