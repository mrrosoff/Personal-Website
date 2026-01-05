import assert from "assert";

import EmulatorState from "../emulator-state/EmulatorState";
import Snake from "../../components/terminal/games/SnakeGame";

export const optDef = {};

const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    try {
        state.setBlockingMode({});
        return {
            output: <Snake emulatorState={state} />,
            type: "react"
        };
    } catch (err: unknown) {
        assert(err instanceof Error);
        return { output: err.message, type: "error" };
    }
};

export const manPage = `NAME
     snake -- play the classic snake game

SYNOPSIS
     snake

DESCRIPTION
     The snake command launches a classic snake game. Use arrow keys to control
     the snake, eat the red food to grow and increase your score. The game ends
     if you collide with walls or yourself.

CONTROLS
     Arrow Keys    Control snake direction

EXAMPLES
     snake`;

export default { optDef, functionDef, manPage };
