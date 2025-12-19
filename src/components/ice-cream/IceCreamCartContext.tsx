import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import axios from "axios";

import { DatabaseFlavor } from "../../../api/types";
import { API_URL } from "../App";

type IceCreamCartContextType = {
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
    showCartIndicator: boolean;
    flavors: DatabaseFlavor[];
    isLoadingFlavors: boolean;
    flavorsError: string | null;
};

const IceCreamCartContext = createContext<IceCreamCartContextType | undefined>(undefined);

export const IceCreamCartProvider = ({ children }: { children: ReactNode }) => {
    const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>([]);
    const [showCartIndicator, setShowCartIndicator] = useState(false);
    const [flavors, setFlavors] = useState<DatabaseFlavor[]>([]);
    const [isLoadingFlavors, setIsLoadingFlavors] = useState(true);
    const [flavorsError, setFlavorsError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchInventory() {
            try {
                setIsLoadingFlavors(true);
                setFlavorsError(null);
                const { data } = await axios.post<{ inventory: DatabaseFlavor[] }>(
                    `${API_URL}/inventory`
                );
                setFlavors(data.inventory);
            } catch (error) {
                setFlavorsError("Failed to load flavors. Please try again later.");
                console.error("Error fetching inventory:", error);
            } finally {
                setIsLoadingFlavors(false);
            }
        }
        void fetchInventory();
    }, []);

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
        <IceCreamCartContext.Provider value={{ selectedPriceIds, toggleFlavor, showCartIndicator, flavors, isLoadingFlavors, flavorsError }}>
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
