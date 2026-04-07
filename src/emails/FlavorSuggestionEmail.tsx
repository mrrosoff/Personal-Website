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

const FlavorSuggestionEmail = (props: { friendName?: string; flavor?: string }) => {
    const friendName = props.friendName ?? "Someone";
    const flavor = props.flavor ?? "Unknown Flavor";
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
                    {friendName} suggested a new flavor: {flavor}
                </Preview>
                <Container
                    style={{
                        backgroundColor: "#FFFFFF",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                >
                    <Section>
                        <Heading style={{ marginBottom: 24 }}>
                            💡 Flavor Suggestion From {friendName}
                        </Heading>
                        <Text
                            style={{
                                fontSize: 24,
                                fontWeight: 200,
                                color: "rgb(17,24,39)",
                                marginTop: 16,
                                marginBottom: 0
                            }}
                        >
                            {flavor}
                        </Text>
                    </Section>
                    <Hr
                        style={{
                            width: "100%",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "rgb(209,213,219)"
                        }}
                    />
                    <Footer />
                </Container>
            </Body>
        </Html>
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
                        src="https://maxrosoff.com/images-external/ice-cream.png"
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
                        Max's Freezer Stash
                    </Text>
                    <Text
                        style={{
                            margin: undefined,
                            fontSize: 12,
                            lineHeight: undefined,
                            fontWeight: 600,
                            color: "rgb(107,114,128)"
                        }}
                    >
                        Flavor Lab
                    </Text>
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
                            4122 17th Street
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
                            San Fransisco, CA 94114
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

FlavorSuggestionEmail.PreviewProps = {
    friendName: "Max",
    flavor: "Lavender Honey Cardamom"
};

export default FlavorSuggestionEmail;
