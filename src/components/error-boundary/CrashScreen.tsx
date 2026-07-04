import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

type Phase = "crashed" | "restarting" | "booting" | "clearing";

const RESTART_DURATION_MS = 3000;
const BOOT_DURATION_MS = 1000;
const BOOT_LINE_INTERVAL_MS = 40;
const CLEAR_DURATION_MS = 1000;

const BOOT_LINES = [
    "[  OK  ] Started Load Kernel Modules.",
    "[  OK  ] Mounted /boot/efi.",
    "[  OK  ] Reached target Local File Systems.",
    "systemd[1]: Starting Network Manager...",
    "kernel: PCI: Using ACPI for IRQ routing",
    "kernel: EXT4-fs (sda1): mounted filesystem with ordered data mode",
    "[  OK  ] Started Network Manager.",
    "[  OK  ] Reached target Network.",
    "systemd[1]: Starting Rosoff OS Daemon...",
    "kernel: usb 1-1: new high-speed USB device",
    "[  OK  ] Started Rosoff OS Daemon.",
    "systemd-journald[123]: Runtime Journal is using 8.0M",
    "[  OK  ] Started D-Bus System Message Bus.",
    "kernel: random: crng init done",
    "[  OK  ] Reached target Multi-User System.",
    "systemd[1]: Starting Update UTMP about System Boot/Shutdown...",
    "kernel: TCP: cubic registered",
    "[  OK  ] Started Session c1 of user dev.",
    "login[456]: pam_unix(login:session): session opened for user dev"
];

const randomBootLine = () => BOOT_LINES[Math.floor(Math.random() * BOOT_LINES.length)];

const CrashScreen = () => {
    const [visibleCursor, setVisibleCursor] = useState(true);
    const [phase, setPhase] = useState<Phase>("crashed");
    const [dots, setDots] = useState(0);
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        const interval = setInterval(() => setVisibleCursor((visible) => !visible), 600);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (phase !== "restarting") return;

        const dotsInterval = setInterval(() => {
            setDots((prevDots) => (prevDots + 1) % 4);
        }, 500);
        const bootTimeout = setTimeout(() => {
            setPhase("booting");
        }, RESTART_DURATION_MS);

        return () => {
            clearInterval(dotsInterval);
            clearTimeout(bootTimeout);
        };
    }, [phase]);

    useEffect(() => {
        if (phase !== "booting") return;

        const linesInterval = setInterval(() => {
            setLines((prevLines) => [...prevLines, randomBootLine()].slice(-20));
        }, BOOT_LINE_INTERVAL_MS);
        const clearTimeoutId = setTimeout(() => {
            setPhase("clearing");
        }, BOOT_DURATION_MS);

        return () => {
            clearInterval(linesInterval);
            clearTimeout(clearTimeoutId);
        };
    }, [phase]);

    useEffect(() => {
        if (phase !== "clearing") return;

        const redirectTimeout = setTimeout(() => {
            window.location.href = "/";
        }, CLEAR_DURATION_MS);

        return () => clearTimeout(redirectTimeout);
    }, [phase]);

    if (phase === "clearing") {
        return <Box position={"fixed"} top={0} left={0} right={0} bottom={0} bgcolor={"#121212"} />;
    }

    if (phase === "booting") {
        return (
            <Box
                position={"fixed"}
                top={0}
                left={0}
                right={0}
                bottom={0}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"flex-start"}
                boxSizing={"border-box"}
                p={4}
                sx={{ backgroundColor: "#121212", overflow: "hidden" }}
            >
                {lines.map((line, index) => (
                    <Typography key={index} style={{ color: "#FCFCFC", fontSize: 14 }}>
                        {line}
                    </Typography>
                ))}
            </Box>
        );
    }

    return (
        <Box
            position={"fixed"}
            top={0}
            left={0}
            right={0}
            bottom={0}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            boxSizing={"border-box"}
            p={4}
            sx={{ backgroundColor: "#121212", overflow: "hidden" }}
        >
            <Typography style={{ color: "#FCFCFC", fontSize: 22 }}>
                <Box component={"span"} style={{ color: "#2BC903" }}>
                    dev@rosoff
                </Box>
                :~$ run --production
            </Typography>
            <Typography style={{ color: "#ff0606", fontSize: 22 }}>
                Segmentation fault (core dumped)
            </Typography>
            <Box height={16} />
            <Typography component={"div"} style={{ color: "#FCFCFC", fontSize: 22 }}>
                <Box component={"span"} style={{ color: "#2BC903" }}>
                    dev@rosoff
                </Box>
                :~${" "}
                <Box
                    component={phase === "restarting" ? "span" : "a"}
                    onClick={phase === "restarting" ? undefined : () => setPhase("restarting")}
                    sx={{
                        color: "#FCFCFC",
                        cursor: phase === "restarting" ? "default" : "pointer",
                        fontWeight: "bold",
                        textDecoration: "none",
                        animation: "crash-screen-pulse 2.5s ease-in-out infinite",
                        ...(phase !== "restarting" && {
                            "&:hover": { color: "#2BC903", textDecoration: "underline" }
                        }),
                        "@keyframes crash-screen-pulse": {
                            "0%, 100%": { opacity: 1 },
                            "50%": { opacity: 0.4 }
                        }
                    }}
                >
                    restart{".".repeat(dots)}
                </Box>
                <Box
                    component={"span"}
                    sx={{
                        display: "inline-block",
                        width: "10px",
                        height: "24px",
                        ml: 1,
                        verticalAlign: "middle",
                        visibility: phase !== "restarting" && visibleCursor ? "visible" : "hidden",
                        background: "#FFFFFF"
                    }}
                />
            </Typography>
        </Box>
    );
};

export default CrashScreen;
