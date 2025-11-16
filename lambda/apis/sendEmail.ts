import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import MailingListEmail from "../../src/components/emails/MailingListEmail";
import { buildResponse, HttpResponseStatus } from "../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const broadcastId = await createBroadcast(resend);
    const sendBroadcastId = await sendBroadcast(resend, broadcastId);
    return buildResponse(event, HttpResponseStatus.OK, { broadcastId: sendBroadcastId });
};

async function createBroadcast(resend: Resend): Promise<string> {
    const { data, error } = await resend.broadcasts.create({
        name: "Ice Cream Flavor Drop",
        audienceId: process.env.RESEND_AUDIENCE_ID!,
        from: "Max and Josette <drops@ice-cream.maxrosoff.com>",
        replyTo: "me@maxrosoff.com",
        subject: "New Ice Cream Flavor Drop!",
        react: MailingListEmail()
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
