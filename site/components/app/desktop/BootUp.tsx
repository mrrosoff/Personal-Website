import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";

import { HAS_BOOTED_KEY, useAppContext } from "../../AppContext";
import BootLine from "./BootUp/BootLine";
import Header from "./BootUp/Header";
import StartingComputer from "./BootUp/StartingComputer";
import SystemInfo from "./BootUp/SystemInfo";

type NetworkInformation = { type?: string; effectiveType?: string };

function getNetworkLabel(): string {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.type && connection.type !== "unknown") {
        return ` (${connection.type.toUpperCase()})`;
    }
    if (connection?.effectiveType) {
        return ` (${connection.effectiveType.toUpperCase()})`;
    }
    return "";
}

const STEP_TIMES = [
    300, 450, 650, 850, 1050, 1200, 1350, 1500, 1650, 1800, 1950, 2200, 2500, 3000, 3500, 3850,
    4350, 4700, 5250
];
const FINISHED_AT = 6400;

const SUCCESS = { text: "SUCCESS", ok: true };

type BootUpProps = {
    setBootingUp: Dispatch<SetStateAction<boolean>>;
    creationDate: string;
};

const BootUp = ({ setBootingUp, creationDate }: BootUpProps) => {
    const [step, setStep] = useState(0);
    const { setShouldBootUp } = useAppContext();
    const theme = useTheme();
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        const timeouts = STEP_TIMES.map((ms, index) => setTimeout(() => setStep(index + 1), ms));
        timeouts.push(
            setTimeout(() => {
                sessionStorage.setItem(HAS_BOOTED_KEY, "true");
                setShouldBootUp(false);
                setBootingUp(false);
            }, FINISHED_AT)
        );
        return () => timeouts.forEach(clearTimeout);
    }, [setBootingUp, setShouldBootUp]);

    const online = navigator.onLine;

    return (
        <Stack spacing={4}>
            <Header creationDate={creationDate} smallScreen={smallScreen} />
            {step >= 1 && <Box>AF6S7V89 - JUC84X</Box>}
            {step >= 2 && <SystemInfo step={step} />}
            {step >= 12 && (
                <Stack spacing={1}>
                    <BootLine
                        label={`Detecting ${smallScreen ? "" : "Primary "}Drive (/dev/sda1)`}
                        dots={smallScreen ? 4 : 6}
                        status={step >= 13 ? SUCCESS : undefined}
                    />
                    {!smallScreen && (
                        <BootLine
                            label="Detecting Secondary Drive (/dev/sda2)"
                            dots={6}
                            status={step >= 14 ? SUCCESS : undefined}
                        />
                    )}
                </Stack>
            )}
            {step >= 15 && (
                <Stack spacing={1}>
                    <BootLine
                        label={`Detecting Network Link${getNetworkLabel()}`}
                        dots={smallScreen ? 3 : 6}
                        status={
                            step >= 16
                                ? { text: online ? "CONNECTED" : "OFFLINE", ok: online }
                                : undefined
                        }
                    />
                    {step >= 17 && !smallScreen && (
                        <BootLine
                            label="Initializing OS"
                            dots={6}
                            status={step >= 18 ? SUCCESS : undefined}
                        />
                    )}
                </Stack>
            )}
            {step >= 19 && <StartingComputer />}
        </Stack>
    );
};

export default BootUp;
