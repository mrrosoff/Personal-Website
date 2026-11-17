import { beforeEach, vi } from "vitest";

const actual = await vi.importActual<typeof import("axios")>("axios");

export const axiosGet = vi.fn();
export const axiosPost = vi.fn();

export const { AxiosError, isAxiosError } = actual;

beforeEach(() => {
    axiosGet.mockResolvedValue({ data: {} });
    axiosPost.mockResolvedValue({ data: {} });
});

export default { get: axiosGet, post: axiosPost, AxiosError, isAxiosError };
