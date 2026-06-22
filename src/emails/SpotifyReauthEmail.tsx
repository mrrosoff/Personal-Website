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

const SPOTIFY_GREEN = "#1ED760";

const SpotifyReauthEmail = (props: { name?: string; daysLeft?: number; reconnectUrl?: string }) => {
    const daysLeft = props.daysLeft ?? 7;
    const reconnectUrl = props.reconnectUrl ?? "https://maxrosoff.com";
    const greeting = props.name ? `Hi ${props.name},` : "Hi,";
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
                <Preview>
                    Reconnect Spotify in the next {daysLeft.toString()} days to keep the display
                    running
                </Preview>
                <Container
                    style={{
                        backgroundColor: "#FFFFFF",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                >
                    <Section>
                        <Heading style={{ marginBottom: 0, color: SPOTIFY_GREEN }}>
                            Reconnect Spotify
                        </Heading>
                        <Text
                            style={{
                                fontSize: 16,
                                color: "rgb(107,114,128)",
                                marginTop: 8,
                                marginBottom: 0
                            }}
                        >
                            Keep the display alive.
                        </Text>
                    </Section>
                    <Section style={{ marginTop: 16 }}>
                        <Text style={{ fontSize: 16, color: "rgb(17,24,39)", margin: 0 }}>
                            {greeting}
                        </Text>
                        <Text style={{ fontSize: 16, color: "rgb(17,24,39)" }}>
                            The Spotify connection that powers the display is set to expire in about{" "}
                            <strong>
                                {daysLeft} {daysLeft === 1 ? "day" : "days"}
                            </strong>
                            . Once it lapses, the panel stops showing what's playing until
                            it's reconnected. You can refresh it now in under a minute. No need
                            to wait.
                        </Text>
                        <Text style={{ fontSize: 16, color: "rgb(17,24,39)" }}>
                            Open the terminal at{" "}
                            <Link href={reconnectUrl} style={{ color: SPOTIFY_GREEN }}>
                                maxrosoff.com
                            </Link>{" "}
                            and run <code>sudo su {props.name}</code> then <code>sudo spotify</code>, then
                            approve the Spotify prompt.
                        </Text>
                    </Section>
                    <Section style={{ marginTop: 8, marginBottom: 24 }}>
                        <Button
                            href={reconnectUrl}
                            style={{
                                backgroundColor: SPOTIFY_GREEN,
                                color: "#FFFFFF",
                                fontWeight: 600,
                                fontSize: 16,
                                borderRadius: 9999,
                                padding: "12px 24px"
                            }}
                        >
                            Reconnect Spotify
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
                        You're getting this because you're the Spotify owner for the
                        display. If you'd like to stop receiving these reminders, you can ignore them.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

SpotifyReauthEmail.PreviewProps = {
    name: "Jack",
    daysLeft: 7,
    reconnectUrl: "https://maxrosoff.com"
};

export default SpotifyReauthEmail;
