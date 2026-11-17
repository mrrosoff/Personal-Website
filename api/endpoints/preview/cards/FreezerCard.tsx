import type { DatabaseFlavor } from "../../../types";
import Frame, { Chips, Subtitle, Title } from "../layout/Frame";

type FreezerCardProps = { flavors: DatabaseFlavor[] };

export default function FreezerCard({ flavors }: FreezerCardProps) {
    const freezer = flavors.filter(
        (flavor) =>
            (flavor.type === "currentFlavor" || flavor.type === "lastBatch") && flavor.count > 0
    );
    return (
        <Frame>
            <Title>Max's Freezer Stash</Title>
            <Subtitle>Small batch, $6 a pint</Subtitle>
            {freezer.length > 0 ? <Chips flavors={freezer} /> : <span>Restocking soon</span>}
        </Frame>
    );
}
