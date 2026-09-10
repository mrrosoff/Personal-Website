import type { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { Resend } from "resend";

import FriendInviteEmail from "../../../src/emails/FriendInviteEmail";
import { generateToken, isAdmin, UserType } from "../../auth";
import { getEntireTable } from "../../aws/services/dynamodb";
import { getParameter } from "../../aws/services/parameterStore";
import {
    PASSKEYS_TABLE,
    buildErrorResponse,
    buildResponse,
    HttpResponseStatus
} from "../../common";
import { RP_ORIGIN } from "./passkeyAuthOptions";

const DEFAULT_HOURS = 6;

const durationLabel = (hours: number): string => {
    if (hours >= 24 && hours % 24 === 0) {
        const days = hours / 24;
        return `${days.toString()} ${days === 1 ? "Day" : "Days"}`;
    }
    return `${hours.toString()} ${hours === 1 ? "Hour" : "Hours"}`;
};

type CreateFriendInvitePayload = {
    friendName: string;
    expiresInHours?: number;
    email?: string;
};

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    if (!event.body) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Request Body");
    }

    if (!(await isAdmin(event))) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.UNAUTHORIZED,
            "Authentication required"
        );
    }

    const body: CreateFriendInvitePayload = JSON.parse(event.body);
    const friendName = body.friendName.replace(/\s+/g, " ").trim();
    if (!friendName) {
        return buildErrorResponse(event, HttpResponseStatus.BAD_REQUEST, "Missing Friend Name");
    }

    const takenBy = await findFriendByName(friendName);
    if (takenBy) {
        return buildErrorResponse(
            event,
            HttpResponseStatus.BAD_REQUEST,
            `${takenBy} Is Already Registered. Add A Last Name To Tell Them Apart`
        );
    }

    const expiresInHours = body.expiresInHours ?? DEFAULT_HOURS;
    const email = body.email?.trim();

    const inviteToken = await generateToken(friendName, {
        userType: UserType.SHARE,
        expiresIn: `${expiresInHours}h`
    });
    const url = `${RP_ORIGIN}/register-friend?token=${encodeURIComponent(inviteToken)}`;

    if (email) {
        await sendInviteEmail(email, friendName, url, durationLabel(expiresInHours));
    }

    return buildResponse(event, HttpResponseStatus.OK, { url, token: inviteToken });
};

async function findFriendByName(friendName: string): Promise<string | null> {
    const passkeys = await getEntireTable(PASSKEYS_TABLE);
    const match = passkeys.find(
        (passkey) =>
            passkey.userType === UserType.FRIEND &&
            passkey.name.toLowerCase() === friendName.toLowerCase()
    );
    return match?.name ?? null;
}

async function sendInviteEmail(
    email: string,
    friendName: string,
    inviteUrl: string,
    validFor: string
) {
    const resend = new Resend(await getParameter("/website/resend/api-key"));

    const { error } = await resend.emails.send({
        from: "Max Rosoff <invites@ice-cream.maxrosoff.com>",
        to: email,
        replyTo: "me@maxrosoff.com",
        subject: `You're Invited, ${friendName}`,
        react: FriendInviteEmail({ friendName, inviteUrl, validFor })
    });

    if (error) {
        console.error(error);
        throw Error("Error Sending Friend Invite Email");
    }
}
