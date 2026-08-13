import assert from "assert";

import { decodeToken } from "../../components/App";
import { UserType } from "../../../api/types";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        const environmentVariables = state.getEnvVariables();
        const token = environmentVariables["AUTH_TOKEN"];
        if (!token) {
            return { output: "Permission Denied", type: "error" };
        }

        const payload = decodeToken(token);
        if (payload?.userType !== UserType.ADMIN && payload?.userType !== UserType.POLAROID_OWNER) {
            return { output: "Permission Denied", type: "error" };
        }

        return { output: "/polaroid", type: "navigate" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     polaroid -- navigate to polaroid

SYNOPSIS
     polaroid

DESCRIPTION
     Navigates to the polaroid page where you can upload images
     if you have a compatible device.`;

export default { optDef, functionDef };
