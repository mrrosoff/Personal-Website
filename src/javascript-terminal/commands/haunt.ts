import EmulatorState from "../emulator-state/EmulatorState";

export const optDef = {};

const ghost = `
     .--.
    /    \\
   | o  o |
    \\ __ /
     _||_
    (____)`

const skeleton = `
     ___
   /     \\
  | () () |
   \\  ^  /
    |||||
    |||||`

const bat = `
   /\\___/\\
  {  o o  }
   \\ " " /
    ^^^^^`

const functionDef = (_state: EmulatorState, _commandOptions: string[]) => {
    const decorations = [ghost, skeleton, bat];
    const chosen = decorations[Math.floor(Math.random() * decorations.length)];

    return {
        output: `👻 HAPPY HALLOWEEN! 👻\n${chosen}\n\nBOO!`
    };
};

export const manPage = `NAME
     haunt -- summon spooky Halloween spirits

SYNOPSIS
     haunt

DESCRIPTION
     The haunt command summons ASCII ghosts, pumpkins, and bats. This command
     only works on Halloween (October 31st). Boo!

EXAMPLES
     haunt`;

export default { optDef, functionDef, manPage };
