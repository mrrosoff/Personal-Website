import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";

export const optDef = {};

const createBubble = (message: string): string => {
    const maxWidth = 40;
    const words = message.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxWidth) {
            currentLine += (currentLine ? " " : "") + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length === 0) lines.push("");

    const width = Math.max(...lines.map((l) => l.length));
    const border = "_".repeat(width + 2);

    let bubble = ` ${border}\n`;

    if (lines.length === 1) {
        bubble += `< ${lines[0].padEnd(width)} >\n`;
    } else {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].padEnd(width);
            if (i === 0) {
                bubble += `/ ${line} \\\n`;
            } else if (i === lines.length - 1) {
                bubble += `\\ ${line} /\n`;
            } else {
                bubble += `| ${line} |\n`;
            }
        }
    }

    bubble += ` ${"-".repeat(width + 2)}`;
    return bubble;
};

const cow = `
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;

const functionDef = (_state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    try {
        const message = argv.join(" ") || "moo";
        const bubble = createBubble(message);
        const output = bubble + cow;

        return { output };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     cowsay -- generate an ASCII cow with a message

SYNOPSIS
     cowsay [MESSAGE]

DESCRIPTION
     The cowsay utility generates an ASCII picture of a cow saying something
     provided by the user. If no message is provided, the cow says "moo".

EXAMPLES
     cowsay Hello World
     cowsay "I love terminal interfaces!"`;

export default { optDef, functionDef, manPage };
