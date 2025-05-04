import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

import { ICE_CREAM_FLAVORS } from "../ice-cream/flavors";

const MailingListEmail = () => {
    return (
        <Html>
            <Head />
            <Preview>Thank you for joining our waitlist and for your patience</Preview>
            <Body>
                <Container>
                    <Heading>Current Flavors</Heading>
                    {ICE_CREAM_FLAVORS.currentFlavors.map((flavor, index) => (
                        <Text key={index}>{flavor.name}</Text>
                    ))}
                </Container>
                <Container>
                    <Heading>Last Batch</Heading>
                    {ICE_CREAM_FLAVORS.lastBatch.map((flavor, index) => (
                        <Text key={index}>{flavor.name}</Text>
                    ))}
                </Container>
                <Container>
                    <Heading>Current Flavors</Heading>
                    {ICE_CREAM_FLAVORS.upcomingFlavors.map((flavor, index) => (
                        <Text key={index}>{flavor.name}</Text>
                    ))}
                </Container>
            </Body>
        </Html>
    );
};

export default MailingListEmail;
