import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction
} from "react";

import { CommandMapping, DefaultCommandMapping, EmulatorState } from "../javascript-terminal";
import { RECONNECT_TOKEN_KEY } from "../javascript-terminal/commands/spotify";
import files from "../FileSystem";

export const HAS_BOOTED_KEY = "HAS_BOOTED_UP";

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
                    return { output: "", type: "text" };
                }
                close();
                return { output: "Can't Close Window", type: "error" };
            },
            optDef: {}
        }
    })
});

/**
 * Restore the sudo session that the Spotify reconnect flow stashed before
 * navigating this tab away to Spotify (see RECONNECT_TOKEN_KEY).
 */
const persistedAuthToken = sessionStorage.getItem(RECONNECT_TOKEN_KEY);
if (persistedAuthToken) {
    sessionStorage.removeItem(RECONNECT_TOKEN_KEY);
    initialEmulatorState.setEnvVariables({
        ...initialEmulatorState.getEnvVariables(),
        AUTH_TOKEN: persistedAuthToken
    });
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
