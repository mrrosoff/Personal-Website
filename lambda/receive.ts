import { APIGatewayEvent, APIGatewayProxyEventHeaders, APIGatewayProxyResult } from "aws-lambda";
import { config } from "dotenv";
import { GetInboundEmailResponseSuccess, Resend } from "resend";

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

config();

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildResponse(400, "Missing Request Body");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        await verifyWebhookSignature(resend, event.headers, event.body);
    } catch (error: unknown) {
        console.error("Webhook Signature Verification Failed:", error);
        return buildResponse(400, "Invalid Webhook Signature");
    }

    try {
        const { data }: WebhookPayload = JSON.parse(event.body);
        const email = await retrieveEmailData(resend, data.email_id);
        const attachments = await retrieveEmailAttachments(resend, data.email_id);
        await forwardEmail(resend, email, attachments);
        return buildResponse(200, `Email Successfully Forwarded With ID: ${data.email_id}`);
    } catch (error: unknown) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return buildResponse(500, errorMessage);
    }
};

async function verifyWebhookSignature(
    resend: Resend,
    headers: APIGatewayProxyEventHeaders,
    requestBody: string
): Promise<void> {
    resend.webhooks.verify({
        payload: requestBody,
        headers: {
            id: headers["svix-id"]!,
            timestamp: headers["svix-timestamp"]!,
            signature: headers["svix-signature"]!
        },
        webhookSecret: process.env.RESEND_WEBHOOK_SECRET as string
    });
}

async function retrieveEmailData(
    resend: Resend,
    email_id: string
): Promise<GetInboundEmailResponseSuccess> {
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
    const { data: attachments, error } = await resend.attachments.receiving.list({
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
    email: GetInboundEmailResponseSuccess,
    attachments: { content: string }[]
): Promise<void> {
    const { data, error } = await resend.emails.send({ ...email, attachments });
    if (error || !data) {
        throw Error(`Error Forwarding Email: ${error?.message}`);
    }
}

function buildResponse(statusCode: number, body: string): APIGatewayProxyResult {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "https://maxrosoff.com",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body
    };
}
