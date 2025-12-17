import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import MailingListEmail from "../../../src/components/emails/MailingListEmail";
import { getParameter } from "../../aws/services/parameterStore";
import { buildResponse, HttpResponseStatus } from "../../common";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const apiKey = await getParameter("/website/resend/api-key",);
    const resend = new Resend(apiKey);
    const broadcastId = await createBroadcast(resend);
    const sendBroadcastId = await sendBroadcast(resend, broadcastId);
    return buildResponse(event, HttpResponseStatus.OK, { broadcastId: sendBroadcastId });
};

async function createBroadcast(resend: Resend): Promise<string> {
    const id = await getParameter("/website/resend/audience-id");
    const { data, error } = await resend.broadcasts.create({
        name: "Ice Cream Flavor Drop",
        audienceId: id,
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
