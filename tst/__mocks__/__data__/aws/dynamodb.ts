import { faker } from "@faker-js/faker";
import { createHash } from "node:crypto";
import { DateTime } from "luxon";

import {
    type DatabaseDevice,
    type DatabaseFlavor,
    type DatabasePasskey,
    type DatabasePasskeyChallenge,
    DeviceKind,
    UserType
} from "../../../../api/types";

export const mockDeviceSecret = faker.string.alphanumeric(32);

export const mockFlavor: DatabaseFlavor = {
    productId: `prod_${faker.string.alphanumeric(14)}`,
    priceId: `price_${faker.string.alphanumeric(14)}`,
    name: faker.food.dish(),
    color: faker.color.rgb(),
    count: 5,
    type: "currentFlavor"
};

export const mockDevice: DatabaseDevice = {
    deviceId: faker.string.hexadecimal({ length: 12, casing: "lower", prefix: "" }),
    kind: DeviceKind.POLAROID,
    secretHash: createHash("sha256").update(mockDeviceSecret).digest("hex"),
    lastSeenAt: 0
};

export const mockDeviceToken = `${mockDevice.deviceId}.${mockDeviceSecret}`;

export const mockPasskey: DatabasePasskey = {
    credentialId: faker.string.alphanumeric(22),
    publicKey: faker.string.alphanumeric(88),
    userType: UserType.FRIEND,
    name: faker.person.firstName(),
    email: faker.internet.email().toLowerCase(),
    deviceIds: [mockDevice.deviceId]
};

export const mockChallenge: DatabasePasskeyChallenge = {
    id: faker.string.alphanumeric(43),
    expiresAt: DateTime.now().plus({ minutes: 5 }).toSeconds()
};
