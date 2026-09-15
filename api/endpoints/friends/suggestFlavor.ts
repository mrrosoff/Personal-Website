import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import { getParameter } from "../../aws/services/parameterStore";
import { UserType } from "../../auth";
import { authorize } from "../../permissions";
import { buildErrorResponse, buildResponse, HttpResponseStatus } from "../../common";
import FlavorSuggestionEmail from "../../../src/emails/FlavorSuggestionEmail";

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    const { token, error: authError } = await authorize(event, UserType.FRIEND);
    if (!token) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            authError ?? "Authentication Required"
        );
    }

    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    const body: { flavor: string } = JSON.parse(event.body);
    if (!body.flavor?.trim()) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Flavor Name");
    }

    const apiKey = await getParameter("/website/resend/api-key");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
        from: "Max's Freezer Stash <suggestions@ice-cream.maxrosoff.com>",
        to: "me@maxrosoff.com",
        subject: `Flavor Suggestion From ${token.id}`,
        react: FlavorSuggestionEmail({ friendName: token.id, flavor: body.flavor.trim() })
    });

    if (error) {
        console.error(error);
        throw new Error("Error Sending Flavor Email");
    }

    return buildResponse(event, HttpResponseStatus.OK, { sent: true });
};
