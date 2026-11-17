import Frame, { Subtitle, Title } from "../layout/Frame";

export default function SubscriptionCard() {
    return (
        <Frame>
            <Title>Your Subscription</Title>
            <Subtitle>Two pints a month, $10</Subtitle>
            <span>Manage or cancel anytime</span>
        </Frame>
    );
}
