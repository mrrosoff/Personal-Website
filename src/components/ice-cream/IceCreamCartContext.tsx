import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";

type IceCreamCartContextType = {
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
    showCartIndicator: boolean;
};

const IceCreamCartContext = createContext<IceCreamCartContextType | undefined>(undefined);

export const IceCreamCartProvider = ({ children }: { children: ReactNode }) => {
    const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>([]);
    const [showCartIndicator, setShowCartIndicator] = useState(false);

    const toggleFlavor = (priceId: string | undefined) => {
        if (!priceId) return;
        setSelectedPriceIds((prev) => {
            const isAdding = !prev.includes(priceId);
            const newIds = isAdding ? [...prev, priceId] : prev.filter((id) => id !== priceId);

            if (isAdding) {
                setShowCartIndicator(true);
            }
            return newIds;
        });
    };

    useEffect(() => {
        if (selectedPriceIds.length === 0) {
            setShowCartIndicator(false);
        }
    }, [selectedPriceIds]);

    return (
        <IceCreamCartContext.Provider value={{ selectedPriceIds, toggleFlavor, showCartIndicator }}>
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
