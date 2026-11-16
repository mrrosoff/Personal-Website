import { CustomFont, render } from "@cf-wasm/og/node";

import clacon from "../../../public/fonts/clacon.ttf";
import logo from "../../../public/images/logo.png";
import profile from "../../../public/images/profile.jpg";
import { getEntireTable } from "../../aws/services/dynamodb";
import { FLAVORS_TABLE } from "../../common";
import type { DatabaseFlavor } from "../../types";

const MUTED = "rgba(255, 255, 255, 0.5)";
const GREEN = "#2BC903";
const RED = "#ff0606";

export const handler = async (): Promise<string> => {
    const freezer = await loadFreezer();

    const { image } = await render(
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                padding: 56,
                backgroundColor: "#121212",
                color: "white",
                fontFamily: "Clacon",
                fontSize: 32
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <img src={`data:image/png;base64,${logo}`} width={112} height={112} />
                    <span style={{ fontSize: 52 }}>Max Rosoff</span>
                </div>
                <img
                    src={`data:image/jpeg;base64,${profile}`}
                    width={160}
                    height={160}
                    style={{ borderRadius: 80 }}
                />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 40 }}>
                <span>
                    Initializing OS . . . . . .<span style={{ color: GREEN }}>&nbsp;SUCCESS</span>
                </span>
                <span>
                    Checking Freezer Stash . . . . . .
                    <span style={{ color: freezer.length > 0 ? GREEN : RED }}>
                        &nbsp;{freezer.length > 0 ? `${freezer.length} FLAVORS` : "EMPTY"}
                    </span>
                </span>
            </div>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 14,
                    marginTop: 24,
                    maxWidth: 860
                }}
            >
                {freezer.map((flavor) => (
                    <div
                        key={flavor.productId}
                        style={{
                            display: "flex",
                            padding: "12px 20px",
                            border: `2px solid ${MUTED}`,
                            borderRadius: 6,
                            fontSize: 28,
                            color: flavor.color.toLowerCase() || "white"
                        }}
                    >
                        {flavor.name}
                    </div>
                ))}
            </div>
            <span style={{ marginTop: "auto", color: MUTED }}>maxrosoff.com</span>
        </div>,
        {
            width: 1200,
            height: 630,
            fonts: [new CustomFont("Clacon", Buffer.from(clacon, "base64"))],
            emoji: "twemoji"
        }
    ).asPng();

    return Buffer.from(image).toString("base64");
};

async function loadFreezer(): Promise<DatabaseFlavor[]> {
    try {
        const inventory = await getEntireTable(FLAVORS_TABLE);
        return inventory.filter(
            (f) => (f.type === "currentFlavor" || f.type === "lastBatch") && f.count > 0
        );
    } catch (error) {
        console.error("Rendering the preview with an empty freezer:", error);
        return [];
    }
}
