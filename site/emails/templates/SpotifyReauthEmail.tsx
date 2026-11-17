import { Button, Heading, Hr, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "../EmailLayout";
import { COLORS, EMAIL_COLORS, FONT } from "../../theme";

const SPOTIFY_GREEN = EMAIL_COLORS.spotify;

type SpotifyReauthEmailProps = {
    name?: string;
    daysLeft: number;
    reconnectUrl: string;
};

const SpotifyReauthEmail = (props: SpotifyReauthEmailProps) => {
    const greeting = props.name ? `Hi ${props.name},` : "Hi,";
    const userName = props.name ?? "your name";
    const codeStyle = {
        backgroundColor: EMAIL_COLORS.surface,
        padding: "2px 6px",
        borderRadius: 4,
        fontFamily: FONT.mono
    };
    return (
        <EmailLayout
            preview={
                "Reconnect Spotify in the next {props.daysLeft.toString()} days to keep the display running"
            }
        >
            <Section>
                <Heading style={{ marginBottom: 0, color: SPOTIFY_GREEN }}>
                    Reconnect Spotify
                </Heading>
                <Text
                    style={{
                        fontSize: 16,
                        color: EMAIL_COLORS.muted,
                        marginTop: 8,
                        marginBottom: 0
                    }}
                >
                    Keep the display alive.
                </Text>
            </Section>
            <Section style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text, margin: 0 }}>
                    {greeting}
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    The Spotify connection that powers the display is set to expire in about{" "}
                    <strong>
                        {props.daysLeft} {props.daysLeft === 1 ? "day" : "days"}
                    </strong>
                    . Once it lapses, the panel stops showing what's playing until it's reconnected.
                    You can refresh it now in under a minute. No need to wait.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    Four steps, all of them on the site itself:
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>1. Open the terminal.</strong> Go to{" "}
                    <Link href={props.reconnectUrl} style={{ color: SPOTIFY_GREEN }}>
                        maxrosoff.com
                    </Link>{" "}
                    on a computer. The terminal is the panel on the home page. Click it once so it
                    takes what you type.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>2. Sign in as yourself.</strong> Type{" "}
                    <span style={codeStyle}>sudo su {userName}</span> and press enter. Your device
                    will ask for your face, fingerprint, or screen lock. Approve it.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>3. Start the reconnect.</strong> Type{" "}
                    <span style={codeStyle}>sudo spotify reconnect</span> and press enter. The site
                    will hand you over to Spotify.
                </Text>
                <Text style={{ fontSize: 16, color: EMAIL_COLORS.text }}>
                    <strong>4. Approve the Spotify prompt.</strong> Spotify asks whether the display
                    can see what you're playing. Say yes, and it drops you back on the site with the
                    connection renewed for another two months.
                </Text>
            </Section>
            <Section style={{ marginTop: 8, marginBottom: 24 }}>
                <Button
                    href={props.reconnectUrl}
                    style={{
                        backgroundColor: SPOTIFY_GREEN,
                        color: COLORS.white,
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
                You're getting this because you're the Spotify owner for the display. If you'd like
                to stop receiving these reminders, you can ignore them.
            </Text>
        </EmailLayout>
    );
};

SpotifyReauthEmail.PreviewProps = {
    name: "Jack",
    daysLeft: 7,
    reconnectUrl: "https://maxrosoff.com"
};

export default SpotifyReauthEmail;
