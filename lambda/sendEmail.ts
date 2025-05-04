import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import { ICE_CREAM_FLAVORS } from "../src/components/ice-cream/flavors";

export const handler = async (_event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const broadcastId = await createBroadcast(resend);
    const sendBroadcastId = await sendBroadcast(resend, broadcastId);
    return {
        statusCode: 200,
        body: "Emails Sent Successfully With ID: " + sendBroadcastId
    };
};

async function createBroadcast(resend: Resend): Promise<string> {
    const { data, error } = await resend.broadcasts.create({
        name: "Ice Cream Flavor Drop",
        audienceId: process.env.RESEND_AUDIENCE_ID as string,
        from: "Max and Josette's Ice Cream <me@maxrosoff.com>",
        subject: "New Ice Cream Flavor Drop!",
        html:
            "Hi {{{FIRST_NAME|there}}}, you can unsubscribe here: {{{RESEND_UNSUBSCRIBE_URL}}} <br><br>We have new flavors: " +
            ICE_CREAM_FLAVORS.upcomingFlavors
                .map((flavor) => `<span style="color: ${flavor.color}">${flavor.name}</span>`)
                .join(", ") +
            "<br><br>Check out our current flavors: " +
            ICE_CREAM_FLAVORS.currentFlavors
                .map((flavor) => `<span style="color: ${flavor.color}">${flavor.name}</span>`)
                .join(", ") +
            "<br><br>And our last batch: " +
            ICE_CREAM_FLAVORS.lastBatch
                .map((flavor) => `<span style="color: ${flavor.color}">${flavor.name}</span>`)
                .join(", ") +
            "<br><br>Thanks for being a loyal customer!<br><br>Best,<br>The Ice Cream Team"
    });
    if (error || !data) {
        throw Error(`Error Creating Broadcast: ${error?.message}`);
    }
    return data.id;
}

async function sendBroadcast(resend: Resend, broadcastId: string): Promise<string> {
    const { data, error } = await resend.broadcasts.send(broadcastId);
    if (error || !data) {
        throw Error(`Error Sending Broadcast: ${error?.message}`);
    }
    return data.id;
}
