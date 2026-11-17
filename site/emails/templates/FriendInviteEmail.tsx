import { Button, Heading, Hr, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "../EmailLayout";
import { COLORS, EMAIL_COLORS, FONT } from "../../theme";

type FriendInviteEmailProps = {
    friendName: string;
    inviteUrl: string;
    validFor: string;
};

const FriendInviteEmail = ({ friendName, inviteUrl, validFor }: FriendInviteEmailProps) => {
    return (
        <EmailLayout preview={"Your invite to the rest of maxrosoff.com"}>
            <Section>
                <Heading style={{ marginBottom: 0 }}>Welcome, {friendName}</Heading>
                <Text
                    style={{
                        fontSize: 16,
                        color: EMAIL_COLORS.muted,
                        marginTop: 8,
                        marginBottom: 0
                    }}
                >
                    Max saved you a seat at the terminal.
                </Text>
            </Section>
            <Section style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    There are parts of the site I keep behind a passkey. This gets you in. Here is
                    the whole thing, start to finish:
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>1. Open the button below on the device you actually use.</strong> The
                    passkey is tied to whatever phone or laptop you register from, so pick the one
                    you will have on you. Your phone is usually the right answer.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>2. Enter your email and press Register Passkey.</strong> Your device
                    will ask for your face, your fingerprint, or your screen lock. That is the whole
                    signup. There is no password to pick and nothing to remember.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>3. Come back to the site and identify yourself.</strong> On a computer,
                    type{" "}
                    <span
                        style={{
                            backgroundColor: EMAIL_COLORS.surface,
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontFamily: FONT.mono
                        }}
                    >
                        sudo su {friendName}
                    </span>{" "}
                    into the terminal on the home page and press enter. The terminal is there on a
                    phone too, so the step is the same either way.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>4. Confirm with the same passkey.</strong> You will get the face or
                    fingerprint prompt one more time, and then you are in. Every visit after this
                    one is just step 3 and step 4.
                </Text>
            </Section>
            <Section style={{ marginTop: 8, marginBottom: 24 }}>
                <Button
                    href={inviteUrl}
                    style={{
                        backgroundColor: COLORS.button,
                        color: COLORS.white,
                        fontWeight: 600,
                        fontSize: 16,
                        borderRadius: 9999,
                        padding: "12px 24px"
                    }}
                >
                    Register Your Passkey
                </Button>
            </Section>
            <Hr
                style={{
                    width: "100%",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: EMAIL_COLORS.border
                }}
            />
            <Text
                style={{
                    marginTop: 16,
                    marginBottom: 16,
                    fontSize: 12,
                    color: EMAIL_COLORS.muted,
                    lineHeight: 1.5
                }}
            >
                This link works for {validFor}. If it expires, ask Max for a new one. If you weren't
                expecting it, ignore this email and nothing happens. Curious first?{" "}
                <Link href="https://maxrosoff.com" style={{ color: COLORS.button }}>
                    maxrosoff.com
                </Link>
                .
            </Text>
        </EmailLayout>
    );
};

FriendInviteEmail.PreviewProps = {
    friendName: "ada",
    inviteUrl: "https://maxrosoff.com/register-friend?token=example",
    validFor: "7 Days"
};

export default FriendInviteEmail;
