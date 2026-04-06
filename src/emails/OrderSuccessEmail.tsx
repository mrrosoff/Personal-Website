import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text
} from "@react-email/components";

type OrderItem = {
    name: string;
    quantity: number;
};

const OrderSuccessEmail = (props: {
    customerName?: string;
    customerEmail?: string;
    items?: OrderItem[];
}) => {
    const items = props.items ?? [];
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
                    New order from {props.customerName || props.customerEmail || "a customer"}
                </Preview>
                <Container
                    style={{
                        backgroundColor: "#FFFFFF",
                        paddingLeft: "20px",
                        paddingRight: "20px"
                    }}
                >
                    <Section>
                        <Heading style={{ marginBottom: 0 }}>New Order</Heading>
                        {props.customerName && (
                            <Text style={{ fontSize: 14, color: "rgb(107,114,128)", marginBottom: 0 }}>
                                Customer: {props.customerName}
                            </Text>
                        )}
                        {props.customerEmail && (
                            <Text
                                style={{
                                    fontSize: 14,
                                    color: "rgb(107,114,128)",
                                    marginTop: props.customerName ? 4 : undefined
                                }}
                            >
                                Email: {props.customerEmail}
                            </Text>
                        )}
                    </Section>
                    <Hr
                        style={{
                            width: "100%",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "rgb(209,213,219)"
                        }}
                    />
                    <Section>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "rgb(17,24,39)",
                                marginBottom: 8
                            }}
                        >
                            Items Ordered
                        </Text>
                        {items.map((item, index) => (
                            <Text
                                key={index}
                                style={{
                                    fontSize: 14,
                                    color: "rgb(17,24,39)",
                                    marginTop: 4,
                                    marginBottom: 4
                                }}
                            >
                                {item.quantity}x {item.name}
                            </Text>
                        ))}
                    </Section>
                    <Hr
                        style={{
                            marginTop: 16,
                            width: "100%",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderColor: "rgb(209,213,219)"
                        }}
                    />
                    <Section>
                        <Text style={{ fontSize: 12, color: "rgb(107,114,128)" }}>
                            This is an automated order notification from maxrosoff.com
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default OrderSuccessEmail;
