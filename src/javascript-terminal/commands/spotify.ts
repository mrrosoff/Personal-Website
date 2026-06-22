import axios from "axios";

import { UserType } from "../../../api/types";
import { API_URL, decodeToken } from "../../components/App";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

async function openAuthorization(token: string) {
    try {
        const { data } = await axios.post(
            `${API_URL}/spotify/connect`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        window.open(data.authorizeUrl, "_blank", "noopener");
    } catch (err) {
        console.error("Spotify Authentication Failed:", err);
    }
}

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    const token = state.getEnvVariables()["AUTH_TOKEN"];
    if (!token) {
        return { output: "Permission Denied", type: "error" };
    }

    const payload = decodeToken(token);
    if (!payload || (payload.userType !== UserType.ADMIN && payload.userType !== UserType.FRIEND)) {
        return { output: "Permission Denied", type: "error" };
    }

    void openAuthorization(token);
    return { output: "Opening Spotify Authorization Page", type: "text" };
};

export const manPage = `NAME
     spotify -- reconnect the Spotify display

SYNOPSIS
     sudo spotify

DESCRIPTION
     Starts the Spotify authorization flow and opens the consent page so the
     display owner can grant a fresh refresh token. Must be invoked via sudo.`;

export default { optDef, functionDef, manPage };
