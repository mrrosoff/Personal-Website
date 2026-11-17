import { Heading, Hr, Section, Text } from "@react-email/components";
import { EmailFooter, EmailLayout } from "../EmailLayout";

type FlavorSuggestionEmailProps = {
    friendName: string;
    flavor: string;
};

const FlavorSuggestionEmail = ({ friendName, flavor }: FlavorSuggestionEmailProps) => {
    return (
        <EmailLayout preview={`${friendName} suggested a new flavor: ${flavor}`}>
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
            <EmailFooter tagline={"Flavor Lab"} />
        </EmailLayout>
    );
};

FlavorSuggestionEmail.PreviewProps = {
    friendName: "Max",
    flavor: "Lavender Honey Cardamom"
};

export default FlavorSuggestionEmail;
