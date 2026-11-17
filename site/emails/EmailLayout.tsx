import type { ReactNode } from "react";

import {
    Body,
    Column,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text
} from "@react-email/components";
import { COLORS, EMAIL_COLORS } from "../theme";

type EmailLayoutProps = { preview: string; children: ReactNode };

export const EmailLayout = (props: EmailLayoutProps) => (
    <Html>
        <Head />
        <Body
            style={{
                backgroundColor: EMAIL_COLORS.page,
                fontFamily:
                    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
            }}
        >
            <Preview>{props.preview}</Preview>
            <Container
                style={{
                    backgroundColor: COLORS.white,
                    paddingLeft: "20px",
                    paddingRight: "20px"
                }}
            >
                {props.children}
            </Container>
        </Body>
    </Html>
);

type EmailFooterProps = { tagline: string; href?: string };

export const EmailFooter = (props: EmailFooterProps) => {
    const tagline = (
        <Text
            style={{
                fontSize: 12,
                fontWeight: 600,
                color: EMAIL_COLORS.muted
            }}
        >
            {props.tagline}
        </Text>
    );
    return (
        <Section style={{ marginTop: 16, marginBottom: 16 }}>
            <Row>
                <Column colSpan={4}>
                    <Img
                        alt="Ice Cream Logo"
                        height="20"
                        src="https://maxrosoff.com/images/ice-cream.png"
                    />
                    <Text
                        style={{
                            marginTop: "12px",
                            marginBottom: "0px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: EMAIL_COLORS.text
                        }}
                    >
                        Max's Freezer Stash
                    </Text>
                    {props.href ? <Link href={props.href}>{tagline}</Link> : tagline}
                </Column>
                <Column align="right" style={{ display: "table-cell", verticalAlign: "bottom" }}>
                    <Row
                        style={{
                            display: "table-cell",
                            verticalAlign: "bottom"
                        }}
                    >
                        <Column style={{ paddingRight: 8 }}>
                            <Link href="https://www.facebook.com/maxr.rosoff">
                                <Img
                                    alt="Facebook"
                                    height="20"
                                    src="https://react.email/static/facebook-logo.png"
                                    width="20"
                                />
                            </Link>
                        </Column>
                        <Column>
                            <Link href="https://www.instagram.com/thenameismr.r/">
                                <Img
                                    alt="Instagram"
                                    height="20"
                                    src="https://react.email/static/instagram-logo.png"
                                    width="20"
                                />
                            </Link>
                        </Column>
                    </Row>
                    <Row>
                        <Text
                            style={{
                                marginTop: "12px",
                                marginBottom: "0px",
                                textAlign: "right",
                                fontSize: 12,
                                fontWeight: 600,
                                color: EMAIL_COLORS.muted
                            }}
                        >
                            4122 17th Street
                        </Text>
                        <Text
                            style={{
                                marginTop: "0px",
                                marginBottom: "4px",
                                textAlign: "right",
                                fontSize: 12,
                                fontWeight: 600,
                                color: EMAIL_COLORS.muted
                            }}
                        >
                            San Francisco, CA 94114
                        </Text>
                        <Text
                            style={{
                                textAlign: "right",
                                fontSize: 12,
                                fontWeight: 600,
                                color: EMAIL_COLORS.muted
                            }}
                        >
                            me@maxrosoff.com
                        </Text>
                    </Row>
                </Column>
            </Row>
        </Section>
    );
};
