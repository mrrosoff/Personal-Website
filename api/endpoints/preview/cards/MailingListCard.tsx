import type { DatabaseFlavor } from "../../../types";
import Frame, { Chips, Subtitle, Title } from "../layout/Frame";

type MailingListCardProps = { flavors: DatabaseFlavor[] };

export default function MailingListCard({ flavors }: MailingListCardProps) {
    const upcoming = flavors.filter((flavor) => flavor.type === "upcoming");
    return (
        <Frame>
            <Title>Mailing List</Title>
            <Subtitle>
                {upcoming.length > 0 ? "Hear first when these drop" : "New flavors, first"}
            </Subtitle>
            {upcoming.length > 0 && <Chips flavors={upcoming} />}
        </Frame>
    );
}
