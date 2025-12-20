import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";
import { parseOptions } from "../parser";
import { manPage as catManPage } from "./cat";
import { manPage as cdManPage } from "./cd";
import { manPage as clearManPage } from "./clear";
import { manPage as consoleManPage } from "./console";
import { manPage as cpManPage } from "./cp";
import { manPage as dateManPage } from "./date";
import { manPage as diffManPage } from "./diff";
import { manPage as displayManPage } from "./display";
import { manPage as echoManPage } from "./echo";
import { manPage as exportManPage } from "./export";
import { manPage as findManPage } from "./find";
import { manPage as grepManPage } from "./grep";
import { manPage as headManPage } from "./head";
import { manPage as historyManPage } from "./history";
import { manPage as icecreamManPage } from "./icecream";
import { manPage as lsManPage } from "./ls";
import { manPage as mkdirManPage } from "./mkdir";
import { manPage as mvManPage } from "./mv";
import { manPage as printenvManPage } from "./printenv";
import { manPage as pwdManPage } from "./pwd";
import { manPage as rmManPage } from "./rm";
import { manPage as rmdirManPage } from "./rmdir";
import { manPage as sedManPage } from "./sed";
import { manPage as sortManPage } from "./sort";
import { manPage as sudoManPage } from "./sudo";
import { manPage as tailManPage } from "./tail";
import { manPage as teeManPage } from "./tee";
import { manPage as touchManPage } from "./touch";
import { manPage as wcManPage } from "./wc";
import { manPage as whoamiManPage } from "./whoami";

export const optDef = {};

const manPages: Record<string, string> = {
    cat: catManPage,
    cd: cdManPage,
    clear: clearManPage,
    console: consoleManPage,
    cp: cpManPage,
    date: dateManPage,
    diff: diffManPage,
    display: displayManPage,
    echo: echoManPage,
    export: exportManPage,
    find: findManPage,
    grep: grepManPage,
    head: headManPage,
    history: historyManPage,
    icecream: icecreamManPage,
    ls: lsManPage,
    mkdir: mkdirManPage,
    mv: mvManPage,
    printenv: printenvManPage,
    pwd: pwdManPage,
    rm: rmManPage,
    rmdir: rmdirManPage,
    sed: sedManPage,
    sort: sortManPage,
    sudo: sudoManPage,
    tail: tailManPage,
    tee: teeManPage,
    touch: touchManPage,
    wc: wcManPage,
    whoami: whoamiManPage
};

const functionDef = (_state: EmulatorState, commandOptions: string[]) => {
    const { argv } = parseOptions(commandOptions, optDef);

    if (argv.length !== 1) {
        return {};
    }

    try {
        const command = argv[0];
        const manPage = manPages[command];

        if (manPage) {
            return { output: manPage };
        }

        return { output: "" };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     man -- display manual pages

SYNOPSIS
     man command

DESCRIPTION
     The man utility displays the manual page for the specified command.`;

export default { optDef, functionDef };
