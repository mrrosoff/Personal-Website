import axios from "axios";

import { UserType } from "../../../api/types";
import { API_URL, decodeToken } from "../../components/App";
import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

/**
 * The auth flow navigates this tab away to Spotify, which unloads the app and
 * drops the in-memory AUTH_TOKEN session. Stash it here so the app can restore
 * it when Spotify redirects back. sessionStorage survives a same-tab,
 * cross-origin round trip and is scoped to this tab.
 */
export const RECONNECT_TOKEN_KEY = "SPOTIFY_RECONNECT_AUTH_TOKEN";

async function openAuthorization(token: string) {
    try {
        const { data } = await axios.post(
            `${API_URL}/spotify/connect`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        sessionStorage.setItem(RECONNECT_TOKEN_KEY, token);
        window.location.assign(data.authorizeUrl);
    } catch (err) {
        console.error("Spotify Authentication Failed:", err);
    }
}

const functionDef = (state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv[0] !== "reconnect") {
        return { output: manPage, type: "text" };
    }

    const token = state.getEnvVariables()["AUTH_TOKEN"];
    if (!token) {
        return { output: "Permission Denied", type: "error" };
    }

    const payload = decodeToken(token);
    if (
        !payload ||
        (payload.userType !== UserType.ADMIN && payload.userType !== UserType.SPOTIFY_OWNER)
    ) {
        return { output: "Permission Denied", type: "error" };
    }

    void openAuthorization(token);
    return { output: "Opening Spotify Authorization Page...", type: "text" };
};

export const manPage = `NAME
     spotify -- reconnect the Spotify display

SYNOPSIS
     sudo spotify reconnect

DESCRIPTION
     Starts the Spotify authorization flow and opens the consent page so the
     display owner can grant a fresh refresh token. Must be invoked via sudo.`;

export default { optDef, functionDef, manPage };
