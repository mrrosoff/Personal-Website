import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import { FLAVORS_TABLE } from "../../../infrastructure/WebsiteAPIStack";
import { getParameter } from "../../aws/services/parameterStore";
import { getAllItems } from "../../aws/services/dynamodb";
import MailingListEmail from "../../../src/emails/MailingListEmail";
import OrderSuccessEmail from "../../../src/emails/OrderSuccessEmail";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";

type SendEmailPayload = {
    message: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: SendEmailPayload = JSON.parse(event.body);
    const message = body.message.trim();

    const apiKey = await getParameter("/website/resend/api-key");
    const resend = new Resend(apiKey);
    const broadcastId = await createBroadcast(resend, message);
    const sendBroadcastId = await sendBroadcast(resend, broadcastId);
    return buildResponse(event, HttpResponseStatus.OK, { broadcastId: sendBroadcastId });
};

async function createBroadcast(resend: Resend, message?: string): Promise<string> {
    const id = await getParameter("/website/resend/audience-id");

    const allFlavors = await getAllItems(FLAVORS_TABLE);

    const currentFlavors = allFlavors.filter((f) => f.type === "currentFlavor");
    const lastBatch = allFlavors.filter((f) => f.type === "lastBatch");
    const upcoming = allFlavors.filter((f) => f.type === "upcoming");

    const { data, error } = await resend.broadcasts.create({
        name: "Ice Cream Flavor Drop",
        audienceId: id,
        from: "Max <drops@ice-cream.maxrosoff.com>",
        replyTo: "me@maxrosoff.com",
        subject: "New Ice Cream Flavor Drop!",
        react: MailingListEmail({ currentFlavors, lastBatch, upcoming, message })
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

type OrderItem = {
    name: string;
    quantity: number;
};

export async function sendOrderSuccessEmail(params: {
    customerName?: string;
    customerEmail?: string;
    items: OrderItem[];
}) {
    const apiKey = await getParameter("/website/resend/api-key");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
        from: "Max's Freezer Stash <orders@ice-cream.maxrosoff.com>",
        to: "me@maxrosoff.com",
        subject: "Ice Cream Order",
        react: OrderSuccessEmail(params)
    });

    if (error) {
        console.error(error);
        throw Error("Error Sending Order Success Email");
    }
}
