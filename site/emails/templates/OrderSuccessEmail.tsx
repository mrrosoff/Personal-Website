import { Column, Heading, Hr, Link, Row, Section, Text } from "@react-email/components";
import { EmailFooter, EmailLayout } from "../EmailLayout";
import type Stripe from "stripe";
import { EMAIL_COLORS } from "../../theme";

type OrderItem = {
    name: string;
    quantity: number;
};

const customerSubtitles = [
    "Your pints are being packed!",
    "Churning as we speak!",
    "The freezer has been raided on your behalf!",
    "Cold things are headed your way!",
    "Two scoops closer to happiness!",
    "Max is on it!"
];

const subtitles = [
    "Time to fire up the ice cream machine!",
    "Another happy customer incoming!",
    "Scoops away!",
    "The freezer is calling!",
    "Let's get churning!",
    "Ice cream waits for no one!"
];

export const orderSubtitle = (forCustomer: boolean): string => {
    const pool = forCustomer ? customerSubtitles : subtitles;
    return pool[Math.floor(Math.random() * pool.length)];
};

const orderHeading = (forCustomer: boolean, customerName?: string) => {
    if (forCustomer) {
        return customerName ? `Thanks, ${customerName}!` : "Thanks For Your Order!";
    }
    return customerName ? `Order From ${customerName}` : "New Order";
};

type OrderSuccessEmailProps = {
    customerName?: string;
    customerEmail?: string;
    shippingAddress?: Stripe.Address;
    items: OrderItem[];
    subtitle: string;
    forCustomer?: boolean;
};

const OrderSuccessEmail = (props: OrderSuccessEmailProps) => {
    const forCustomer = props.forCustomer ?? false;
    const heading = orderHeading(forCustomer, props.customerName);
    const pints = `${props.items.length.toString()} ${props.items.length === 1 ? "pint" : "pints"}`;
    const preview = forCustomer
        ? `Your ice cream order for ${pints}`
        : `New order from ${props.customerName ?? props.customerEmail ?? "a customer"} for ${pints}`;
    return (
        <EmailLayout preview={preview}>
            <Section>
                <Heading style={{ marginBottom: 0 }}>{heading}</Heading>
                <Text
                    style={{
                        fontSize: 16,
                        color: EMAIL_COLORS.muted,
                        marginTop: 8,
                        marginBottom: 0
                    }}
                >
                    {props.subtitle}
                    {!forCustomer && props.customerEmail && (
                        <>
                            {" "}
                            Reach them at{" "}
                            <Link
                                href={`mailto:${props.customerEmail}`}
                                style={{ color: EMAIL_COLORS.accent }}
                            >
                                {props.customerEmail}
                            </Link>
                            .
                        </>
                    )}
                </Text>
            </Section>
            <Section style={{ marginTop: 16, marginBottom: 16 }}>
                {props.items.map((item, index) => (
                    <Section key={index} style={{ marginBottom: 8 }}>
                        <Row>
                            <Column style={{ verticalAlign: "baseline", width: 35 }}>
                                <table style={{ textAlign: "center" }}>
                                    <td
                                        align="center"
                                        style={{
                                            height: 30,
                                            width: 30,
                                            backgroundColor: EMAIL_COLORS.highlightLight,
                                            borderRadius: 9999,
                                            padding: "0px"
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontWeight: 600,
                                                margin: "0px",
                                                color: EMAIL_COLORS.highlight
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
                                        color: EMAIL_COLORS.text
                                    }}
                                >
                                    {item.name}
                                </Text>
                            </Column>
                        </Row>
                    </Section>
                ))}
            </Section>
            {props.shippingAddress && (
                <Section style={{ marginBottom: 16 }}>
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: EMAIL_COLORS.muted,
                            margin: "0px"
                        }}
                    >
                        {forCustomer ? "Delivering To" : "Deliver To"}
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            lineHeight: "24px",
                            color: EMAIL_COLORS.text,
                            margin: "4px 0px 0px"
                        }}
                    >
                        <Link
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(props.shippingAddress).join(", "))}`}
                            style={{ color: EMAIL_COLORS.accent }}
                        >
                            {formatAddress(props.shippingAddress).map((line) => (
                                <span key={line}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </Link>
                    </Text>
                </Section>
            )}
            <Hr
                style={{
                    width: "100%",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: EMAIL_COLORS.border
                }}
            />
            <EmailFooter tagline={"Order Up!"} />
        </EmailLayout>
    );
};

const formatAddress = (address: Stripe.Address) =>
    [
        address.line1,
        address.line2,
        [[address.city, address.state].filter(Boolean).join(", "), address.postal_code]
            .filter(Boolean)
            .join(" ")
    ].filter((line): line is string => !!line);

OrderSuccessEmail.PreviewProps = {
    subtitle: subtitles[0],
    customerName: "Max",
    customerEmail: "me@maxrosoff.com",
    shippingAddress: {
        line1: "123 Main St",
        line2: "Apt 4",
        city: "Denver",
        state: "CO",
        postal_code: "80202",
        country: "US"
    },
    items: [
        { name: "Strawberry Basil 🍓", quantity: 1 },
        { name: "Mango Sticky Rice 🥭", quantity: 1 },
        { name: "Dark Chocolate Sea Salt 🍫", quantity: 2 }
    ]
};

export default OrderSuccessEmail;
