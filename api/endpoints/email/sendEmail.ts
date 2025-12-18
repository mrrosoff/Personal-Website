import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { getParameter } from "../../aws/services/parameterStore";
import { getAllItems } from "../../aws/services/dynamodb";
import MailingListEmail from "../../../src/components/emails/MailingListEmail";
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

    const allFlavors = await getAllItems(FLAVORS_TABLE);

    const currentFlavors = allFlavors.filter((f) => f.type === "currentFlavor");
    const lastBatch = allFlavors.filter((f) => f.type === "lastBatch");
    const upcoming = allFlavors.filter((f) => f.type === "upcoming");

    const { data, error } = await resend.broadcasts.create({
        name: "Ice Cream Flavor Drop",
        audienceId: id,
        from: "Max and Josette <drops@ice-cream.maxrosoff.com>",
        replyTo: "me@maxrosoff.com",
        subject: "New Ice Cream Flavor Drop!",
        react: MailingListEmail({ currentFlavors, lastBatch, upcoming })
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
