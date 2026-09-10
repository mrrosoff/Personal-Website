import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text
} from "@react-email/components";

const ICE_CREAM_PINK = "#E8709A";

const CancelSubscriptionEmail = (props: { cancelUrl?: string; minutesValid?: number }) => {
    const cancelUrl = props.cancelUrl ?? "https://maxrosoff.com/ice-cream/cancel";
    const minutesValid = props.minutesValid ?? 30;
    return (
        <Html>
            <Head />
            <Body
                style={{
                    backgroundColor: "#DBDDDE",
                    fontFamily:
                        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
                }}
            >
                <Preview>Your link to cancel the ice cream subscription</Preview>
                <Container
                    style={{
                        backgroundColor: "#FFFFFF",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                >
                    <Section>
                        <Heading style={{ marginBottom: 0 }}>Cancel Your Subscription</Heading>
                        <Text
                            style={{
                                fontSize: 16,
                                color: "rgb(107,114,128)",
                                marginTop: 8,
                                marginBottom: 0
                            }}
                        >
                            No hard feelings. The freezer will be here.
                        </Text>
                    </Section>
                    <Section style={{ marginTop: 16 }}>
                        <Text style={{ fontSize: 16, color: "rgb(17,24,39)" }}>
                            Someone asked to cancel the ice cream subscription for this address. Use
                            the button below and the monthly charge stops right away. Pints you have
                            already paid for are still yours.
                        </Text>
                        <Text style={{ fontSize: 16, color: "rgb(17,24,39)" }}>
                            If that wasn't you, ignore this email and nothing changes.
                        </Text>
                    </Section>
                    <Section style={{ marginTop: 8, marginBottom: 24 }}>
                        <Button
                            href={cancelUrl}
                            style={{
                                backgroundColor: ICE_CREAM_PINK,
                                color: "#FFFFFF",
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
                            borderColor: "rgb(209,213,219)"
                        }}
                    />
                    <Text
                        style={{
                            marginTop: 16,
                            marginBottom: 16,
                            fontSize: 12,
                            color: "rgb(107,114,128)",
                            lineHeight: 1.5
                        }}
                    >
                        This link works for {minutesValid.toString()} minutes. If it expires, ask
                        for a new one from{" "}
                        <Link
                            href="https://maxrosoff.com/ice-cream"
                            style={{ color: ICE_CREAM_PINK }}
                        >
                            maxrosoff.com/ice-cream
                        </Link>
                        .
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

CancelSubscriptionEmail.PreviewProps = {
    cancelUrl: "https://maxrosoff.com/ice-cream/cancel?token=example",
    minutesValid: 30
};

export default CancelSubscriptionEmail;
