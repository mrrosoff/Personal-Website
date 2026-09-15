import axios from "axios";

import { DeviceKind } from "../../../api/types";
import { API_URL } from "../../components/App";
import { decodeToken, ownsDeviceKind } from "../../auth";
import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

async function openAuthorization(token: string) {
    try {
        const { data } = await axios.post(
            `${API_URL}/spotify/connect`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
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

    if (!ownsDeviceKind(decodeToken(token), DeviceKind.SPOTIFY)) {
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
