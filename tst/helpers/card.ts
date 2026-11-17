import { isValidElement } from "react";
import type { ReactNode } from "react";

type Component = (props: object) => ReactNode;

export function textOf(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map(textOf).join("");
    }
    if (!isValidElement<{ children?: ReactNode }>(node)) {
        return "";
    }
    return typeof node.type === "function"
        ? textOf((node.type as Component)(node.props))
        : textOf(node.props.children);
}
