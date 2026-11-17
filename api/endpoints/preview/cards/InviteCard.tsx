import { COLORS } from "../../../../site/theme";
import type { ShareToken } from "../../../types";
import Frame, { Title } from "../layout/Frame";
import StatusLine, { StatusLines, expiry } from "../layout/StatusLine";

const LONGEST_NAME = 18;

type InviteCardProps = { invite: ShareToken };

function shorten(name: string): string {
    return name.length > LONGEST_NAME ? `${name.slice(0, LONGEST_NAME - 1)}…` : name;
}

export default function InviteCard({ invite }: InviteCardProps) {
    const { date, expired } = expiry(invite.exp);
    return (
        <Frame>
            <Title>You're Invited</Title>
            <span style={{ fontSize: 64, color: COLORS.green }}>{shorten(invite.id)}</span>
            <StatusLines>
                <StatusLine
                    label="Access Level"
                    status={expired ? "EXPIRED" : "VIP"}
                    ok={!expired}
                />
                <StatusLine label={expired ? "Expired" : "Expires"} status={date} ok={!expired} />
            </StatusLines>
        </Frame>
    );
}
