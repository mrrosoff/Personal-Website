import { beforeEach, vi } from "vitest";
import type * as Axios from "axios";

const actual = await vi.importActual<typeof Axios>("axios");

export const axiosGet = vi.fn();
export const axiosPost = vi.fn();

export const { AxiosError, isAxiosError } = actual;

beforeEach(() => {
    axiosGet.mockResolvedValue({ data: {} });
    axiosPost.mockResolvedValue({ data: {} });
});

export default { get: axiosGet, post: axiosPost, AxiosError, isAxiosError };
