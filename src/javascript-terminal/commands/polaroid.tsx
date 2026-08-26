import { decodeToken } from "../../auth";
import { UserType } from "../../../api/types";
import EmulatorState from "../emulator-state/EmulatorState";
import { errorMessage } from "../emulator-state/CommandMapping";

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
        return { output: errorMessage(err), type: "error" };
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
