import { APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyResult } from "aws-lambda";
import { CreateEmailOptions, GetReceivingEmailResponseSuccess, Resend } from "resend";

import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import { getParameter } from "../../aws/services/parameterStore";

type WebhookPayload = {
    type: string;
    created_at: string;
    data: EmailReceivedWebhookData;
};

type EmailReceivedWebhookData = {
    email_id: string;
    created_at: string;
    from: string;
    to: string[];
    subject: string;
    attachments: {
        id: string;
        filename: string;
        content_type: string;
        content_disposition: string;
        content_id: string;
    }[];
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const apiKey = await getParameter("/website/resend/api-key");
    const resend = new Resend(apiKey);
    const result = await verifyWebhookSignature(resend, event.headers, event.body);
    if (!result) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            "Invalid Webhook Signature"
        );
    }

    const { data }: WebhookPayload = JSON.parse(event.body);
    const email = await retrieveEmailData(resend, data.email_id);
    const attachments = await retrieveEmailAttachments(resend, data.email_id);
    await forwardEmail(resend, email, attachments);
    return buildResponse(event, HttpResponseStatus.OK, data);
};

async function verifyWebhookSignature(
    resend: Resend,
    headers: APIGatewayProxyEventHeaders,
    requestBody: string
): Promise<boolean> {
    const secret = await getParameter("/website/resend/webhook",);
    try {
        resend.webhooks.verify({
            payload: requestBody,
            headers: {
                id: headers["svix-id"]!,
                timestamp: headers["svix-timestamp"]!,
                signature: headers["svix-signature"]!
            },
            webhookSecret: secret
        });
        return true;
    } catch (error: unknown) {
        console.error("Webhook Signature Verification Failed", error);
        return false;
    }
}

async function retrieveEmailData(
    resend: Resend,
    email_id: string
): Promise<GetReceivingEmailResponseSuccess> {
    const { data, error } = await resend.emails.receiving.get(email_id);
    if (error || !data) {
        throw Error(`Error Fetching Email: ${error?.message}`);
    }
    return data;
}

async function retrieveEmailAttachments(
    resend: Resend,
    emailId: string
): Promise<{ content: string }[]> {
    const { data: attachments, error } = await resend.emails.attachments.list({
        emailId
    });
    if (error || !attachments) {
        throw Error(`Error Retrieving Email Attachments: ${error?.message}`);
    }

    const attachmentList = [];
    for (const attachment of attachments.data) {
        const response = await fetch(attachment.download_url);
        const buffer = Buffer.from(await response.arrayBuffer());
        attachmentList.push({ ...attachment, content: buffer.toString("base64") });
    }
    return attachmentList;
}

async function forwardEmail(
    resend: Resend,
    email: GetReceivingEmailResponseSuccess,
    attachments: { content: string }[]
): Promise<void> {
    const { data, error } = await resend.emails.send({
        ...(email as CreateEmailOptions),
        from: "forwarding@ice-cream.maxrosoff.com",
        replyTo: email.from,
        to: ["me@maxrosoff.com"],
        attachments
    });
    if (error || !data) {
        throw Error(`Error Forwarding Email: ${error?.message}`);
    }
}
