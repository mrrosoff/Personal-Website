import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";

import { type AccessToken, type DeviceKind, UserType } from "../api/types";

export const AUTH_TOKEN_KEY = "AUTH_TOKEN";

export const decodeToken = (token: string): AccessToken | null => {
    try {
        return jwtDecode<AccessToken>(token);
    } catch {
        return null;
    }
};

export const ownsDeviceKind = (payload: AccessToken | null, kind: DeviceKind): boolean =>
    payload?.userType === UserType.ADMIN || !!payload?.deviceKinds?.includes(kind);

export const unexpiredToken = (token: string | null) => {
    if (!token) return null;

    const payload = decodeToken(token);
    if (!payload) {
        console.error("Auth Token Invalid");
        return null;
    }

    return DateTime.fromSeconds(payload.exp) > DateTime.now() ? token : null;
};
