import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";

import { ICE_CREAM_FLAVORS } from "../ice-cream/flavors";

const MailingListEmail = () => {
    return (
        <Html>
            <Head />
            <Body>
                <Preview>Here's this month's new flavors...</Preview>
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

                <Hr style={hr} />
            </Body>
        </Html>
    );
};

const hr = {
    borderColor: "#e8eaed",
    margin: "20px"
};

export default MailingListEmail;
