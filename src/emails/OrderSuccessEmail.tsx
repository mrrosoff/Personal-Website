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

type OrderItem = {
    name: string;
    quantity: number;
};

const subtitles = [
    "Time to fire up the ice cream machine!",
    "Another happy customer incoming!",
    "Scoops away!",
    "The freezer is calling!",
    "Let's get churning!",
    "Ice cream waits for no one!"
];

const OrderSuccessEmail = (props: {
    customerName?: string;
    customerEmail?: string;
    items?: OrderItem[];
}) => {
    const items = props.items ?? [];
    const subtitle = subtitles[Math.floor(Math.random() * subtitles.length)];
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
                    New order from {props.customerName || props.customerEmail || "a customer"} for{" "}
                    {items.length.toString()} {items.length === 1 ? "pint" : "pints"}
                </Preview>
                <Container
                    style={{
                        backgroundColor: "#FFFFFF",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                >
                    <Section>
                        <Heading style={{ marginBottom: 0 }}>
                            {props.customerName ? `Order From ${props.customerName}` : "New Order"}
                        </Heading>
                        <Text
                            style={{
                                fontSize: 16,
                                color: "rgb(107,114,128)",
                                marginTop: 8,
                                marginBottom: 0
                            }}
                        >
                            {subtitle}
                            {props.customerEmail && (
                                <>
                                    {" "}
                                    Reach them at{" "}
                                    <Link
                                        href={`mailto:${props.customerEmail}`}
                                        style={{ color: "rgb(79,70,229)" }}
                                    >
                                        {props.customerEmail}
                                    </Link>
                                    .
                                </>
                            )}
                        </Text>
                    </Section>
                    <Section style={{ marginTop: 16, marginBottom: 16 }}>
                        {items.map((item, index) => (
                            <Section key={index} style={{ marginBottom: 8 }}>
                                <Row>
                                    <Column style={{ verticalAlign: "baseline", width: 35 }}>
                                        <table style={{ textAlign: "center" }}>
                                            <td
                                                align="center"
                                                style={{
                                                    height: 30,
                                                    width: 30,
                                                    backgroundColor: "rgb(254,215,170)",
                                                    borderRadius: 9999,
                                                    padding: "0px"
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontWeight: 600,
                                                        margin: "0px",
                                                        color: "rgb(234,88,12)"
                                                    }}
                                                >
                                                    {item.quantity}x
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
                                            {item.name}
                                        </Text>
                                    </Column>
                                </Row>
                            </Section>
                        ))}
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
                        Order Up!
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

OrderSuccessEmail.PreviewProps = {
    customerName: "Max",
    customerEmail: "me@maxrosoff.com",
    items: [
        { name: "Strawberry Basil 🍓", quantity: 1 },
        { name: "Mango Sticky Rice 🥭", quantity: 1 },
        { name: "Dark Chocolate Sea Salt 🍫", quantity: 2 }
    ]
};

export default OrderSuccessEmail;
