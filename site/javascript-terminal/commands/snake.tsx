import type EmulatorState from "../emulatorState/EmulatorState";
import Snake from "../../components/terminal/games/SnakeGame";

export const optDef = {};

export const functionDef = (state: EmulatorState, _commandOptions: string[]) => {
    state.setBlockingMode({});
    return {
        output: <Snake />,
        type: "react"
    };
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
