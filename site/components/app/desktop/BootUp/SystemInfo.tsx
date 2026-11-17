import { Stack, Typography } from "@mui/material";

const MEMORY_READINGS: Partial<Record<number, string>> = {
    6: "20KB",
    7: "87KB",
    8: "173KB",
    9: "837KM",
    10: "1.1MB"
};

type SystemInfoProps = { step: number };

export default function SystemInfo(props: SystemInfoProps) {
    const rows: [number, string, string][] = [
        [3, "User:", "Developer"],
        [4, "Device Name:", "Rosoff Virtual Machine"],
        [5, "Memory Test:", MEMORY_READINGS[props.step] ?? "2.0MB"]
    ];
    return (
        <Stack sx={{ pl: "20px" }}>
            {rows
                .filter(([shownAt]) => props.step >= shownAt)
                .map(([, label, value]) => (
                    <Stack key={label} direction="row" spacing={2} sx={{ px: 1 }}>
                        <Typography>{label}</Typography>
                        <Typography>{value}</Typography>
                    </Stack>
                ))}
        </Stack>
    );
}
