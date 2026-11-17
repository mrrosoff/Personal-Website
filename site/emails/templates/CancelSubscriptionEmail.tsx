import { Button, Heading, Hr, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "../EmailLayout";
import { COLORS, EMAIL_COLORS } from "../../theme";

type CancelSubscriptionEmailProps = {
    cancelUrl: string;
    minutesValid: number;
};

const CancelSubscriptionEmail = ({ cancelUrl, minutesValid }: CancelSubscriptionEmailProps) => {
    return (
        <EmailLayout preview={"Your link to cancel the ice cream subscription"}>
            <Section>
                <Heading style={{ marginBottom: 0 }}>Cancel Your Subscription</Heading>
                <Text
                    style={{
                        fontSize: 16,
                        color: EMAIL_COLORS.muted,
                        marginTop: 8,
                        marginBottom: 0
                    }}
                >
                    No hard feelings. The freezer will be here.
                </Text>
            </Section>
            <Section style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    Someone asked to cancel the ice cream subscription for this address. Use the
                    button below and the monthly charge stops right away. Pints you have already
                    paid for are still yours.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    If that wasn't you, ignore this email and nothing changes.
                </Text>
            </Section>
            <Section style={{ marginTop: 8, marginBottom: 24 }}>
                <Button
                    href={cancelUrl}
                    style={{
                        backgroundColor: EMAIL_COLORS.pink,
                        color: COLORS.white,
                        fontWeight: 600,
                        fontSize: 16,
                        borderRadius: 9999,
                        padding: "12px 24px"
                    }}
                >
                    Cancel Subscription
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
                This link works for {minutesValid.toString()} minutes. If it expires, ask for a new
                one from{" "}
                <Link href="https://maxrosoff.com/ice-cream" style={{ color: EMAIL_COLORS.pink }}>
                    maxrosoff.com/ice-cream
                </Link>
                .
            </Text>
        </EmailLayout>
    );
};

CancelSubscriptionEmail.PreviewProps = {
    cancelUrl: "https://maxrosoff.com/ice-cream/cancel?token=example",
    minutesValid: 30
};

export default CancelSubscriptionEmail;
