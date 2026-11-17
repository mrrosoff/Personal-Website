import Frame, { Title } from "../layout/Frame";
import StatusLine, { StatusLines } from "../layout/StatusLine";

export default function HomeCard() {
    return (
        <Frame>
            <Title>Max Rosoff</Title>
            <StatusLines>
                <StatusLine label="Booting OS" status="SUCCESS" ok />
                <StatusLine label="Terminal" status="ONLINE" ok />
                <StatusLine label="Network" status="CONNECTED" ok />
            </StatusLines>
        </Frame>
    );
}
