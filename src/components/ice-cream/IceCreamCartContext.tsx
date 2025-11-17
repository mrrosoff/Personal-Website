import { createContext, useContext, useState, ReactNode } from "react";

type IceCreamCartContextType = {
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
};

const IceCreamCartContext = createContext<IceCreamCartContextType | undefined>(undefined);

export const IceCreamCartProvider = ({ children }: { children: ReactNode }) => {
    const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>([]);

    const toggleFlavor = (priceId: string | undefined) => {
        if (!priceId) return;
        setSelectedPriceIds((prev) =>
            prev.includes(priceId) ? prev.filter((id) => id !== priceId) : [...prev, priceId]
        );
    };

    return (
        <IceCreamCartContext.Provider value={{ selectedPriceIds, toggleFlavor }}>
            {children}
        </IceCreamCartContext.Provider>
    );
};

export const useIceCreamCart = () => {
    const context = useContext(IceCreamCartContext);
    if (context === undefined) {
        throw new Error("useIceCreamCart must be used within IceCreamCartProvider");
    }
    return context;
};
