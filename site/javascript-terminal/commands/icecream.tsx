import type EmulatorState from "../emulatorState/EmulatorState";

export const optDef = {};

export const functionDef = (_state: EmulatorState, _commandOptions: string[]) => {
    return { output: "/ice-cream", type: "navigate" };
};

export const manPage = `NAME
     icecream -- navigate to ice cream shop

SYNOPSIS
     icecream

DESCRIPTION
     Navigates to the ice cream shop page where you can browse and purchase
     ice cream flavors.`;
