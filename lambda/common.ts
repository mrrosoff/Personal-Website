import { APIGatewayProxyResult } from "aws-lambda";

export function buildErrorResponse(statusCode: number, message: string): APIGatewayProxyResult {
    return buildResponse(statusCode, { message });
}

export function buildResponse(
    statusCode: number,
    body: Record<string, any>
): APIGatewayProxyResult {
    return {
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: JSON.stringify(body)
    };
}
