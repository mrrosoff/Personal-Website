import { afterEach, describe, expect, it, vi } from "vitest";

import { textOf } from "../../../../helpers/card";

import InviteCard from "../../../../../api/endpoints/preview/cards/InviteCard";
import { UserType } from "../../../../../api/types";
import type { ShareToken } from "../../../../../api/types";

function invite(id: string, exp: number): ShareToken {
    return { id, userType: UserType.SHARE, iss: "issuer", iat: 0, exp };
}

afterEach(() => {
    vi.useRealTimers();
});

describe("InviteCard", () => {
    it("should name the friend and give them VIP access until the invite expires", () => {
        vi.useFakeTimers({ now: new Date("2026-11-17T20:00:00Z"), toFake: ["Date"] });

        const result = textOf(
            <InviteCard invite={invite("Ada", Date.parse("2026-11-20T20:00:00Z") / 1000)} />
        );

        expect(result).toContain("Ada");
        expect(result).toMatch(/Access Level[ .]+VIP/);
        expect(result).toMatch(/Expires[ .]+NOV 20, 12:00 PM/);
    });

    it("should shorten a long name", () => {
        const result = textOf(
            <InviteCard invite={invite("Bartholomew Montgomery", Date.now() / 1000 + 60)} />
        );

        expect(result).toContain("Bartholomew Montg…");
    });

    it("should say when the invite expired", () => {
        vi.useFakeTimers({ now: new Date("2026-11-21T20:00:00Z"), toFake: ["Date"] });

        const result = textOf(
            <InviteCard invite={invite("Ada", Date.parse("2026-11-20T20:00:00Z") / 1000)} />
        );

        expect(result).toMatch(/Access Level[ .]+EXPIRED/);
        expect(result).toMatch(/Expired[ .]+NOV 20, 12:00 PM/);
    });
});
