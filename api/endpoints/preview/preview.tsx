import { CustomFont, render } from "@cf-wasm/og/node";
import type { APIGatewayProxyEvent, APIGatewayProxyEventQueryStringParameters } from "aws-lambda";
import type { ReactElement } from "react";

import clacon from "../../../public/fonts/clacon.ttf";
import { readToken } from "../../auth";
import { getEntireTable } from "../../aws/services/dynamodb";
import { FLAVORS_TABLE } from "../../common";
import { UserType } from "../../types";
import type { PreviewCardPage } from "../../previewCardPages.mts";
import type { AccessToken, DatabaseFlavor } from "../../types";
import FreezerCard from "./cards/FreezerCard";
import HomeCard from "./cards/HomeCard";
import InviteCard from "./cards/InviteCard";
import MailingListCard from "./cards/MailingListCard";
import SubscriptionCard from "./cards/SubscriptionCard";
import { FONT } from "../../../site/theme";

type PreviewEvent = Partial<Pick<APIGatewayProxyEvent, "queryStringParameters">>;

export const handler = async (event: PreviewEvent = {}): Promise<string> => {
    const { image } = await render(await cardFor(event.queryStringParameters ?? {}), {
        width: 1200,
        height: 630,
        fonts: [new CustomFont(FONT.family, Buffer.from(clacon, "base64"))],
        emoji: "twemoji"
    }).asPng();

    return Buffer.from(image).toString("base64");
};

async function cardFor(params: APIGatewayProxyEventQueryStringParameters): Promise<ReactElement> {
    switch (params.page as PreviewCardPage | undefined) {
        case "/ice-cream":
        case "/ice-cream/checkout":
        case "/ice-cream/checkout/return":
            return <FreezerCard flavors={await loadFlavors()} />;
        case "/ice-cream/mailing-list":
        case "/ice-cream/mailing-list/unsubscribe":
            return <MailingListCard flavors={await loadFlavors()} />;
        case "/ice-cream/cancel": {
            const claims = await readClaims(params.token);
            return claims?.userType === UserType.SUBSCRIBER ? <SubscriptionCard /> : <HomeCard />;
        }
        case "/register-friend": {
            const claims = await readClaims(params.token);
            return claims?.userType === UserType.SHARE ? (
                <InviteCard invite={claims} />
            ) : (
                <HomeCard />
            );
        }
        default:
            return <HomeCard />;
    }
}

async function loadFlavors(): Promise<DatabaseFlavor[]> {
    try {
        return await getEntireTable(FLAVORS_TABLE);
    } catch (error) {
        console.error("Rendering the preview without flavors:", error);
        return [];
    }
}

async function readClaims(token: string | undefined): Promise<AccessToken | null> {
    return token ? await readToken(token).catch(() => null) : null;
}
