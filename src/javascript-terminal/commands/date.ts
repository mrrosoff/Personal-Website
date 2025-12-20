import assert from "assert";

import { parseOptions } from "../parser";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {
    "-u, --utc": ""
};

const functionDef = (_state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const now = new Date();

        if (argv.length > 0 && argv[0].startsWith("+")) {
            const format = argv[0].slice(1);
            let output = format;

            const replacements: Record<string, string> = options.utc
                ? {
                      "%Y": now.getUTCFullYear().toString(),
                      "%y": now.getUTCFullYear().toString().slice(-2),
                      "%m": String(now.getUTCMonth() + 1).padStart(2, "0"),
                      "%d": String(now.getUTCDate()).padStart(2, "0"),
                      "%H": String(now.getUTCHours()).padStart(2, "0"),
                      "%M": String(now.getUTCMinutes()).padStart(2, "0"),
                      "%S": String(now.getUTCSeconds()).padStart(2, "0"),
                      "%A": now.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
                      "%a": now.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
                      "%B": now.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" }),
                      "%b": now.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })
                  }
                : {
                      "%Y": now.getFullYear().toString(),
                      "%y": now.getFullYear().toString().slice(-2),
                      "%m": String(now.getMonth() + 1).padStart(2, "0"),
                      "%d": String(now.getDate()).padStart(2, "0"),
                      "%H": String(now.getHours()).padStart(2, "0"),
                      "%M": String(now.getMinutes()).padStart(2, "0"),
                      "%S": String(now.getSeconds()).padStart(2, "0"),
                      "%A": now.toLocaleDateString("en-US", { weekday: "long" }),
                      "%a": now.toLocaleDateString("en-US", { weekday: "short" }),
                      "%B": now.toLocaleDateString("en-US", { month: "long" }),
                      "%b": now.toLocaleDateString("en-US", { month: "short" })
                  };

            Object.entries(replacements).forEach(([key, value]) => {
                output = output.replace(new RegExp(key, "g"), value);
            });

            return { output };
        }

        const defaultFormat = options.utc
            ? now.toUTCString()
            : now.toDateString() + " " + now.toTimeString().split(" ")[0];
        return { output: defaultFormat };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     date -- display or format date and time

SYNOPSIS
     date [-u] [+format]

DESCRIPTION
     The date utility displays the current date and time. When invoked without
     arguments, it prints the date in a default format. With a +format argument,
     you can customize the output using format specifiers:

     %Y - year (4 digits)
     %y - year (2 digits)
     %m - month (01-12)
     %d - day (01-31)
     %H - hour (00-23)
     %M - minute (00-59)
     %S - second (00-59)
     %A - weekday name (Monday)
     %a - weekday abbreviation (Mon)
     %B - month name (January)
     %b - month abbreviation (Jan)

OPTIONS
     -u, --utc    Display time in UTC instead of local time`;

export default { optDef, functionDef };
