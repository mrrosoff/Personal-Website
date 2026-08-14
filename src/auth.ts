import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";

import type { AccessToken } from "../api/types";

export const AUTH_TOKEN_KEY = "AUTH_TOKEN";

export const decodeToken = (token: string): AccessToken | null => {
    try {
        return jwtDecode<AccessToken>(token);
    } catch {
        return null;
    }
};

export const unexpiredToken = (token: string | null) => {
    try {
        const { exp } = jwtDecode<AccessToken>(token ?? "");
        return DateTime.fromSeconds(exp) > DateTime.now() ? token : null;
    } catch (err) {
        console.error("Auth Token Invalid:", err);
        return null;
    }
};
