import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import MailingListEmail from "../src/components/emails/MailingListEmail";

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
        from: "Max and Josette <drops@ice-cream.maxrosoff.com>",
        subject: "New Ice Cream Flavor Drop!",
        react: MailingListEmail(),
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
