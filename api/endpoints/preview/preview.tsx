import { CustomFont, render } from "@cf-wasm/og/node";
import type { APIGatewayProxyEvent } from "aws-lambda";
import { DateTime } from "luxon";

import clacon from "../../../public/fonts/clacon.ttf";
import profile from "../../../public/images/profile.jpg";
import { readToken } from "../../auth";
import { getEntireTable } from "../../aws/services/dynamodb";
import { FLAVORS_TABLE } from "../../common";
import { UserType } from "../../types";
import type { DatabaseFlavor } from "../../types";

const MUTED = "rgba(255, 255, 255, 0.5)";
const GREEN = "#2BC903";
const RED = "#ff0606";
const LONGEST_NAME = 20;

type StatusLineProps = { label: string; status: string; ok: boolean };

function StatusLine({ label, status, ok }: StatusLineProps) {
    return (
        <span>
            {label} . . . . . .<span style={{ color: ok ? GREEN : RED }}>&nbsp;{status}</span>
        </span>
    );
}

type PreviewEvent = Partial<Pick<APIGatewayProxyEvent, "queryStringParameters">>;

export const handler = async (event: PreviewEvent = {}): Promise<string> => {
    const [freezer, tokenStatus] = await Promise.all([
        loadFreezer(),
        tokenLines(event.queryStringParameters?.token)
    ]);

    const { image } = await render(
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                padding: 48,
                backgroundColor: "#121212",
                color: "white",
                fontFamily: "Clacon",
                fontSize: 44
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 80, marginBottom: 26 }}>Max Rosoff</span>
                    <StatusLine label="Booting OS" status="SUCCESS" ok />
                    {tokenStatus.map((line) => (
                        <StatusLine key={line.label} {...line} />
                    ))}
                    <StatusLine
                        label="Checking Freezer Stash"
                        status={
                            freezer.length > 0 ? `${freezer.length.toString()} FLAVORS` : "EMPTY"
                        }
                        ok={freezer.length > 0}
                    />
                </div>
                <img
                    src={`data:image/jpeg;base64,${profile}`}
                    width={250}
                    height={250}
                    style={{ borderRadius: 125 }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 14,
                    marginTop: 22
                }}
            >
                {freezer.map((flavor) => (
                    <div
                        key={flavor.productId}
                        style={{
                            display: "flex",
                            padding: "10px 22px",
                            border: `2px solid ${MUTED}`,
                            borderRadius: 6,
                            fontSize: 38,
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

async function tokenLines(token: string | undefined): Promise<StatusLineProps[]> {
    if (!token) {
        return [];
    }
    const claims = await readToken(token).catch(() => null);
    if (!claims) {
        return [{ label: "Checking Link", status: "INVALID", ok: false }];
    }
    switch (claims.userType) {
        case UserType.SHARE:
            return [
                { label: "Checking Invite", status: `FOR ${shorten(claims.id)}`, ok: true },
                expiryLine("Invite Expires", claims.exp)
            ];
        case UserType.SUBSCRIBER:
            return [
                { label: "Checking Subscription", status: "FOUND", ok: true },
                expiryLine("Link Expires", claims.exp)
            ];
        default:
            return [];
    }
}

function expiryLine(label: string, exp: number): StatusLineProps {
    const expires = DateTime.fromSeconds(exp, { zone: "America/Los_Angeles" });
    return expires < DateTime.now()
        ? { label, status: "EXPIRED", ok: false }
        : { label, status: expires.toFormat("LLL d, h:mm a").toUpperCase(), ok: true };
}

function shorten(name: string): string {
    const upper = name.toUpperCase();
    return upper.length > LONGEST_NAME ? `${upper.slice(0, LONGEST_NAME - 1)}…` : upper;
}

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
