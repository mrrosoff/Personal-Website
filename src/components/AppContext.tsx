import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

import { CommandMapping, DefaultCommandMapping, EmulatorState } from "../javascript-terminal";
import files from "../FileSystem";

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

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // @ts-expect-error
    const [shouldBootUp, setShouldBootUp] = useState<boolean>(import.meta.env.PROD);
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
