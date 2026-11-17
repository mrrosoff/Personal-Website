import { faker } from "@faker-js/faker";
import type { CreateContactOptions, CreateEmailOptions, GetContactOptions } from "resend";
import { afterEach, beforeEach, vi } from "vitest";

type Contact = { id: string; email: string; firstName?: string; lastName?: string };

export const mockBroadcastId = faker.string.uuid();

export const mockInbox: CreateEmailOptions[] = [];
export const mockContacts = new Map<string, Contact>();

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
    mockResend.emails.send.mockImplementation((email: CreateEmailOptions) => {
        mockInbox.push(email);
        return Promise.resolve({ data: { id: faker.string.uuid() }, error: null });
    });
    mockResend.emails.receiving.get.mockResolvedValue({
        data: { from: faker.internet.email(), subject: faker.lorem.sentence() },
        error: null
    });
    mockResend.emails.attachments.list.mockResolvedValue({ data: { data: [] }, error: null });
    mockResend.contacts.get.mockImplementation(
        ({ email }: GetContactOptions & { email: string }) => {
            const contact = mockContacts.get(email);
            return Promise.resolve(
                contact
                    ? { data: contact, error: null }
                    : { data: null, error: { name: "not_found", message: "Contact not found" } }
            );
        }
    );
    mockResend.contacts.create.mockImplementation((contact: CreateContactOptions) => {
        const id = faker.string.uuid();
        mockContacts.set(contact.email, { ...contact, id });
        return Promise.resolve({ data: { id }, error: null });
    });
    mockResend.contacts.remove.mockImplementation(({ email }: { email: string }) => {
        mockContacts.delete(email);
        return Promise.resolve({ data: {}, error: null });
    });
    mockResend.broadcasts.create.mockResolvedValue({ data: { id: mockBroadcastId }, error: null });
    mockResend.broadcasts.send.mockResolvedValue({ data: { id: mockBroadcastId }, error: null });
});

afterEach(() => {
    mockInbox.length = 0;
    mockContacts.clear();
});

export function Resend() {
    return mockResend;
}
