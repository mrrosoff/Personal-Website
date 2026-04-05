import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

type AppContextType = {
    shouldBootUp: boolean;
    setShouldBootUp: Dispatch<SetStateAction<boolean>>;
    friendToken: string;
    setFriendToken: Dispatch<SetStateAction<string>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // @ts-expect-error
    const [shouldBootUp, setShouldBootUp] = useState<boolean>(import.meta.env.PROD);
    const [friendToken, setFriendToken] = useState<string>("");

    return (
        <AppContext.Provider
            value={{ shouldBootUp, setShouldBootUp, friendToken, setFriendToken }}
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
