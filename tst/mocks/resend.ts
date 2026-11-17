import { faker } from "@faker-js/faker";
import { beforeEach, vi } from "vitest";

export const mockContactId = faker.string.uuid();
export const mockBroadcastId = faker.string.uuid();

export const mockResend = {
    emails: {
        send: vi.fn(),
        receiving: { get: vi.fn() },
        attachments: { list: vi.fn() }
    },
    contacts: { get: vi.fn(), create: vi.fn(), remove: vi.fn() },
    broadcasts: { create: vi.fn(), send: vi.fn() },
    webhooks: { verify: vi.fn() }
};

beforeEach(() => {
    mockResend.emails.send.mockResolvedValue({ data: { id: faker.string.uuid() }, error: null });
    mockResend.emails.receiving.get.mockResolvedValue({
        data: { from: faker.internet.email(), subject: faker.lorem.sentence() },
        error: null
    });
    mockResend.emails.attachments.list.mockResolvedValue({ data: { data: [] }, error: null });
    mockResend.contacts.get.mockResolvedValue({ data: { id: mockContactId }, error: null });
    mockResend.contacts.create.mockResolvedValue({ data: { id: mockContactId }, error: null });
    mockResend.contacts.remove.mockResolvedValue({ data: {}, error: null });
    mockResend.broadcasts.create.mockResolvedValue({ data: { id: mockBroadcastId }, error: null });
    mockResend.broadcasts.send.mockResolvedValue({ data: { id: mockBroadcastId }, error: null });
});

export function Resend() {
    return mockResend;
}
