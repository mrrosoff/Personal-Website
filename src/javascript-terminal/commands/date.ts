import assert from "assert";

import { DateTime } from "luxon";

import { parseOptions } from "../parser";
import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {
    "-u, --utc": ""
};

const functionDef = (_state: EmulatorState, commandOptions: string[]) => {
    const { options, argv } = parseOptions(commandOptions, optDef);

    try {
        const now = options.utc ? DateTime.utc() : DateTime.now();

        if (argv.length > 0 && argv[0].startsWith("+")) {
            const format = argv[0].slice(1);
            let output = format;

            const replacements: Record<string, string> = {
                "%Y": now.toFormat("yyyy"),
                "%y": now.toFormat("yy"),
                "%m": now.toFormat("MM"),
                "%d": now.toFormat("dd"),
                "%H": now.toFormat("HH"),
                "%M": now.toFormat("mm"),
                "%S": now.toFormat("ss"),
                "%A": now.toFormat("EEEE"),
                "%a": now.toFormat("EEE"),
                "%B": now.toFormat("MMMM"),
                "%b": now.toFormat("MMM")
            };

            Object.entries(replacements).forEach(([key, value]) => {
                output = output.replace(new RegExp(key, "g"), value);
            });

            return { output };
        }

        const defaultFormat = options.utc ? now.toHTTP() : now.toFormat("EEE MMM dd yyyy HH:mm:ss");
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
