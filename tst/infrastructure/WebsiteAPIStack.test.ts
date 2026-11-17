import { describe, expect, it } from "vitest";

import { routeForLambda } from "../../infrastructure/WebsiteAPIStack";

describe("routeForLambda", () => {
    it("should drop the endpoints folder and kebab case the handler", () => {
        const result = routeForLambda("endpoints/ice-cream/checkoutStatus");

        expect(result).toBe("ice-cream/checkout-status");
    });

    it("should collapse a handler named after its folder", () => {
        const result = routeForLambda("endpoints/devices/devices");

        expect(result).toBe("devices");
    });

    it("should keep nested admin routes", () => {
        const result = routeForLambda("endpoints/admin/passkeyAuthOptions");

        expect(result).toBe("admin/passkey-auth-options");
    });
});
