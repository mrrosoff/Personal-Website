import { createContext, useContext, useState, type ReactNode } from "react";
import axios from "axios";

import type { DatabaseFlavor } from "../../../api/types";
import { API_URL } from "../App";

type IceCreamCartContextType = {
    flavors: DatabaseFlavor[];
    isLoadingFlavors: boolean;
    flavorsError: string | null;
    loadFlavors: () => Promise<void>;
    refreshFlavors: () => Promise<void>;
    selectedPriceIds: string[];
    toggleFlavor: (priceId: string | undefined) => void;
};

const IceCreamCartContext = createContext<IceCreamCartContextType | undefined>(undefined);

export const IceCreamCartProvider = ({ children }: { children: ReactNode }) => {
    const [selectedPriceIds, setSelectedPriceIds] = useState<string[]>([]);
    const [flavors, setFlavors] = useState<DatabaseFlavor[]>([]);
    const [isLoadingFlavors, setIsLoadingFlavors] = useState(false);
    const [flavorsError, setFlavorsError] = useState<string | null>(null);

    const refreshFlavors = async () => {
        if (isLoadingFlavors) return;

        try {
            setIsLoadingFlavors(true);
            setFlavorsError(null);
            const { data } = await axios.post<{ inventory: DatabaseFlavor[] }>(
                `${API_URL}/ice-cream/inventory`
            );
            setFlavors(data.inventory);
        } catch (error) {
            setFlavorsError("Failed to load flavors. Please try again later.");
            console.error("Error fetching inventory:", error);
        } finally {
            setIsLoadingFlavors(false);
        }
    };

    const loadFlavors = async () => {
        if (flavors.length > 0) return;
        await refreshFlavors();
    };

    const toggleFlavor = (priceId: string | undefined) => {
        if (!priceId) return;
        setSelectedPriceIds((prev) => {
            const isAdding = !prev.includes(priceId);
            return isAdding ? [...prev, priceId] : prev.filter((id) => id !== priceId);
        });
    };

    return (
        <IceCreamCartContext.Provider
            value={{
                selectedPriceIds,
                toggleFlavor,
                flavors,
                isLoadingFlavors,
                flavorsError,
                loadFlavors,
                refreshFlavors
            }}
        >
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
