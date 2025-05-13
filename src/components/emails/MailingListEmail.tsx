import {
    Body,
    Column,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text
} from "@react-email/components";

import { ICE_CREAM_FLAVORS, IceCreamFlavor } from "../ice-cream/flavors";

const MailingListEmail = () => {
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
                <Preview>Here's this month's new flavors...</Preview>
                <Container
                    style={{
                        backgroundColor: "#FFFFFF",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                >
                    <Section>
                        <Heading style={{ marginBottom: 0 }}>Max's Ice Cream Mailing List</Heading>
                        <Text
                            style={{
                                marginBottom: "0px",
                                fontSize: 14,
                                lineHeight: "24px",
                                color: "rgb(107,114,128)"
                            }}
                        >
                            We are excited to share our latest flavors with you. Only $5 per pint.
                        </Text>
                    </Section>
                    <FlavorsList
                        title="New Flavors"
                        description={"Our current rotation of flavors."}
                        flavors={ICE_CREAM_FLAVORS.currentFlavors}
                    />
                    <FlavorsList
                        title="Last Batch"
                        description={"Get them before they are gone! Limited quantities available."}
                        flavors={ICE_CREAM_FLAVORS.lastBatch}
                    />
                    <FlavorsList
                        title="Coming Soon"
                        description={
                            "The following is a list of possible upcoming flavors. Actual availability may vary by seasonal produce and other factors."
                        }
                        flavors={ICE_CREAM_FLAVORS.upcomingFlavors}
                    />
                    <Footer />
                </Container>
            </Body>
        </Html>
    );
};

const FlavorsList = (props: { title: string; description: string; flavors: IceCreamFlavor[] }) => {
    return (
        <Section style={{ marginTop: 16, marginBottom: 16 }}>
            <Section>
                <Row>
                    <Text
                        style={{
                            margin: "0px",
                            fontSize: 24,
                            fontWeight: 600,
                            color: "rgb(17,24,39)"
                        }}
                    >
                        {props.title}
                    </Text>
                    <Text
                        style={{
                            marginTop: 8,
                            fontSize: 16,
                            lineHeight: "24px",
                            color: "rgb(107,114,128)"
                        }}
                    >
                        {props.description}
                    </Text>
                </Row>
            </Section>
            <Hr
                style={{
                    marginTop: 15,
                    marginBottom: 15,
                    width: "100%",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgb(209,213,219) !important"
                }}
            />
            {props.flavors.map((flavor, index) => (
                <>
                    <Section key={flavor.name}>
                        <Row>
                            <Column style={{ verticalAlign: "baseline", width: 35 }}>
                                <table style={{ textAlign: "center" }}>
                                    <td
                                        align="center"
                                        style={{
                                            height: 30,
                                            width: 30,
                                            backgroundColor: "rgb(199,210,254)",
                                            borderRadius: 9999,
                                            padding: "0px"
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontWeight: 600,
                                                margin: "0px",
                                                color: "rgb(79,70,229)"
                                            }}
                                        >
                                            {index + 1}
                                        </Text>
                                    </td>
                                </table>
                            </Column>
                            <Column style={{ paddingLeft: 12 }}>
                                <Text
                                    style={{
                                        margin: "0px",
                                        fontSize: 20,
                                        lineHeight: "28px",
                                        fontWeight: 600,
                                        color: "rgb(17,24,39)"
                                    }}
                                >
                                    {flavor.name}
                                </Text>
                            </Column>
                        </Row>
                    </Section>
                    <Hr
                        style={{
                            marginTop: 15,
                            marginBottom: 15,
                            width: "100%",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "rgb(209,213,219) !important"
                        }}
                    />
                </>
            ))}
        </Section>
    );
};

const Footer = () => {
    return (
        <Section style={{ marginTop: 16, marginBottom: 16 }}>
            <Row>
                <Column colSpan={4}>
                    <Img
                        alt="Ice Cream Logo"
                        height="20"
                        src="https://maxrosoff.com/ice-cream.png"
                    />
                    <Text
                        style={{
                            lineHeight: undefined,
                            marginTop: "12px",
                            marginBottom: "0px",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "rgb(17,24,39)"
                        }}
                    >
                        Max and Josette's
                    </Text>
                    <Text
                        style={{
                            marginTop: "0px",
                            marginBottom: "4px",
                            lineHeight: undefined,
                            margin: "0px",
                            fontSize: 12,
                            color: "rgb(17,24,39)"
                        }}
                    >
                        Ice Cream Factory
                    </Text>
                    <Link href="https://maxrosoff.com/mailing-list/unsubscribe">
                        <Text
                            style={{
                                margin: undefined,
                                fontSize: 12,
                                lineHeight: undefined,
                                fontWeight: 600,
                                color: "rgb(107,114,128)"
                            }}
                        >
                            Unsubscribe
                        </Text>
                    </Link>
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
                                lineHeight: undefined,
                                fontWeight: 600,
                                color: "rgb(107,114,128)"
                            }}
                        >
                            200 Belmont Ave E
                        </Text>
                        <Text
                            style={{
                                marginTop: "0px",
                                marginBottom: "4px",
                                textAlign: "right",
                                fontSize: 12,
                                lineHeight: undefined,
                                fontWeight: 600,
                                color: "rgb(107,114,128)"
                            }}
                        >
                            Seattle, WA 98102
                        </Text>
                        <Text
                            style={{
                                textAlign: "right",
                                margin: undefined,
                                fontSize: 12,
                                lineHeight: undefined,
                                fontWeight: 600,
                                color: "rgb(107,114,128)"
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

export default MailingListEmail;
