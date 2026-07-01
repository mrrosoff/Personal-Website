import { UserType } from "../../../api/types";
import { decodeToken } from "../../components/App";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    const token = state.getEnvVariables()["AUTH_TOKEN"];
    const payload = token ? decodeToken(token) : null;
    const user = payload?.userType === UserType.ADMIN ? "admin" : (payload?.id ?? "dev");
    return { output: user };
};

export const manPage = `NAME
     whoami -- display effective user name

SYNOPSIS
     whoami

DESCRIPTION
     The whoami utility displays your effective user name.`;

export default { optDef, functionDef };
