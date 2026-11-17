import { Column, Heading, Hr, Link, Row, Section, Text } from "@react-email/components";
import { EmailFooter, EmailLayout } from "../EmailLayout";

import type { DatabaseFlavor } from "../../../api/types";
import { EMAIL_COLORS } from "../../theme";

const MailingListEmail = (props: {
    currentFlavors: DatabaseFlavor[];
    lastBatch: DatabaseFlavor[];
    upcoming: DatabaseFlavor[];
    message?: string;
}) => {
    return (
        <EmailLayout preview={"Here's this month's new flavors..."}>
            <Section>
                <Heading style={{ marginBottom: 0 }}>Max's Ice Cream Mailing List</Heading>
                <Text
                    style={{
                        marginBottom: "0px",
                        fontSize: 14,
                        lineHeight: "24px",
                        color: EMAIL_COLORS.muted
                    }}
                >
                    We are excited to share our latest flavors with you. Only $5 per pint.
                </Text>
                <Text
                    style={{
                        marginTop: "0px",
                        fontSize: 14,
                        lineHeight: "24px",
                        color: EMAIL_COLORS.muted
                    }}
                >
                    If you are in San Francisco, buy online at{" "}
                    <Link target={"_blank"} href="https://maxrosoff.com/ice-cream">
                        maxrosoff.com/ice-cream
                    </Link>
                </Text>
            </Section>
            {props.message && (
                <Section>
                    <Text
                        style={{
                            fontSize: 15,
                            lineHeight: "24px",
                            color: EMAIL_COLORS.text,
                            whiteSpace: "pre-wrap"
                        }}
                    >
                        {props.message}
                    </Text>
                </Section>
            )}
            <FlavorsList
                title="New Flavors"
                description={"Our current rotation of flavors."}
                flavors={props.currentFlavors}
            />
            <FlavorsList
                title="Last Batch"
                description={"Get them before they are gone! Limited quantities available."}
                flavors={props.lastBatch}
            />
            <FlavorsList
                title="Coming Soon"
                description={
                    "The following is a list of possible upcoming flavors. Actual availability may vary by seasonal produce and other factors."
                }
                flavors={props.upcoming}
            />
            <EmailFooter
                tagline={"Unsubscribe"}
                href={"https://maxrosoff.com/ice-cream/mailing-list/unsubscribe"}
            />
        </EmailLayout>
    );
};

const FlavorsList = (props: { title: string; description: string; flavors: DatabaseFlavor[] }) => {
    if (!props.flavors.length) {
        return null;
    }

    return (
        <Section style={{ marginTop: 16, marginBottom: 16 }}>
            <Section>
                <Row>
                    <Text
                        style={{
                            margin: "0px",
                            fontSize: 24,
                            fontWeight: 600,
                            color: EMAIL_COLORS.text
                        }}
                    >
                        {props.title}
                    </Text>
                    <Text
                        style={{
                            marginTop: 8,
                            fontSize: 16,
                            lineHeight: "24px",
                            color: EMAIL_COLORS.muted
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
                    borderColor: `${EMAIL_COLORS.border} !important`
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
                                            backgroundColor: EMAIL_COLORS.accentLight,
                                            borderRadius: 9999,
                                            padding: "0px"
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontWeight: 600,
                                                margin: "0px",
                                                color: EMAIL_COLORS.accent
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
                                        color: EMAIL_COLORS.text
                                    }}
                                >
                                    {flavor.priceId ? (
                                        <a
                                            target={"_blank"}
                                            style={{ color: "black", textDecoration: "none" }}
                                            href={`https://maxrosoff.com/ice-cream?flavor=${flavor.priceId}`}
                                        >
                                            {flavor.name}
                                        </a>
                                    ) : (
                                        flavor.name
                                    )}
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
                            borderColor: `${EMAIL_COLORS.border} !important`
                        }}
                    />
                </>
            ))}
        </Section>
    );
};

MailingListEmail.PreviewProps = {
    message: "I found some berries in the basement, so naturally I churned them into ice cream.",
    currentFlavors: [
        {
            productId: "1",
            priceId: "p1",
            name: "Strawberry Basil 🍓",
            color: "pink",
            count: 12,
            type: "currentFlavor" as const
        },
        {
            productId: "2",
            priceId: "p2",
            name: "Mango Sticky Rice 🥭",
            color: "orange",
            count: 8,
            type: "currentFlavor" as const
        }
    ],
    lastBatch: [
        {
            productId: "3",
            priceId: "p3",
            name: "Dark Chocolate Sea Salt 🍫",
            color: "brown",
            count: 3,
            type: "lastBatch" as const
        }
    ],
    upcoming: [
        {
            productId: "4",
            priceId: "",
            name: "Lavender Honey 💜",
            color: "purple",
            count: 0,
            type: "upcoming" as const
        },
        {
            productId: "5",
            priceId: "",
            name: "Ube Coconut 🥥",
            color: "violet",
            count: 0,
            type: "upcoming" as const
        }
    ]
};

export default MailingListEmail;
