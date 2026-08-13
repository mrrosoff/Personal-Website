import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction
} from "react";

import { jwtDecode } from "jwt-decode";
import { DateTime } from "luxon";

import type { AccessToken } from "../../api/types";
import { CommandMapping, DefaultCommandMapping, EmulatorState } from "../javascript-terminal";
import files from "../FileSystem";

export const HAS_BOOTED_KEY = "HAS_BOOTED_UP";
export const AUTH_TOKEN_KEY = "AUTH_TOKEN";

type AppContextType = {
    shouldBootUp: boolean;
    setShouldBootUp: Dispatch<SetStateAction<boolean>>;
    friendToken: string;
    setFriendToken: Dispatch<SetStateAction<string>>;
    emulatorState: EmulatorState;
    setEmulatorState: Dispatch<SetStateAction<EmulatorState>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialEmulatorState = EmulatorState.create({
    fs: files,
    commandMapping: CommandMapping.create({
        ...DefaultCommandMapping,
        exit: {
            functionDef: (state) => {
                if (state.getEnvVariables()["AUTH_TOKEN"]) {
                    const { AUTH_TOKEN: _removed, ...rest } = state.getEnvVariables();
                    state.setEnvVariables(rest);
                    sessionStorage.removeItem(AUTH_TOKEN_KEY);
                    return { output: "", type: "text" };
                }
                close();
                return { output: "Can't Close Window", type: "error" };
            },
            optDef: {}
        }
    })
});

const storedAuthToken = sessionStorage.getItem(AUTH_TOKEN_KEY);

let persistedAuthToken: string | null = null;
try {
    const { exp } = jwtDecode<AccessToken>(storedAuthToken ?? "");
    persistedAuthToken = DateTime.fromSeconds(exp) > DateTime.now() ? storedAuthToken : null;
} catch (err) {
    console.error("Stored Auth Token Invalid:", err);
}

if (persistedAuthToken) {
    initialEmulatorState.setEnvVariables({
        ...initialEmulatorState.getEnvVariables(),
        AUTH_TOKEN: persistedAuthToken
    });
} else {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const hasBootedUp = sessionStorage.getItem(HAS_BOOTED_KEY) !== null;
    const [shouldBootUp, setShouldBootUp] = useState<boolean>(import.meta.env.PROD && !hasBootedUp);

    const [friendToken, setFriendToken] = useState<string>("");
    const [emulatorState, setEmulatorState] = useState<EmulatorState>(initialEmulatorState);

    return (
        <AppContext.Provider
            value={{
                shouldBootUp,
                setShouldBootUp,
                friendToken,
                setFriendToken,
                emulatorState,
                setEmulatorState
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within AppProvider");
    }
    return context;
};
