import { useEffect, useState } from "react";

export default function useLoadingDots(): string {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(
            () => setDots((prev) => (prev.length >= 3 ? "." : prev + ".")),
            500
        );
        return () => clearInterval(interval);
    }, []);

    return dots;
}
