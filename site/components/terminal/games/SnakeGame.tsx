import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useAppContext } from "../../AppContext";

type Position = { x: number; y: number };

const GRID_WIDTH = 25;
const GRID_HEIGHT = 12;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 12, y: 6 }];
const INITIAL_DIRECTION: Position = { x: 1, y: 0 };
const GAME_SPEED = 150;

type Game = {
    snake: Position[];
    direction: Position;
    food: Position;
    score: number;
    over: boolean;
};

const INITIAL_GAME: Game = {
    snake: INITIAL_SNAKE,
    direction: INITIAL_DIRECTION,
    food: { x: 18, y: 6 },
    score: 0,
    over: false
};

const DIRECTIONS: Partial<Record<string, Position>> = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
};

function randomFood(snake: Position[]): Position {
    let food: Position;
    do {
        food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
    } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
    return food;
}

function turn(game: Game, direction: Position): Game {
    const reversing = direction.x === -game.direction.x || direction.y === -game.direction.y;
    return reversing ? game : { ...game, direction };
}

function tick(game: Game): Game {
    const head = game.snake[0];
    const next = { x: head.x + game.direction.x, y: head.y + game.direction.y };
    const offBoard = next.x < 0 || next.x >= GRID_WIDTH || next.y < 0 || next.y >= GRID_HEIGHT;
    const intoItself = game.snake.some((segment) => segment.x === next.x && segment.y === next.y);
    if (offBoard || intoItself) {
        return { ...game, over: true };
    }

    const snake = [next, ...game.snake];
    if (next.x === game.food.x && next.y === game.food.y) {
        return { ...game, snake, food: randomFood(snake), score: game.score + 10 };
    }
    return { ...game, snake: snake.slice(0, -1) };
}

const SnakeGame = () => {
    const { emulatorState } = useAppContext();
    const [game, setGame] = useState(INITIAL_GAME);
    const [countdown, setCountdown] = useState(3);
    const loading = countdown > 0;

    useEffect(() => {
        if (game.over) {
            const timer = setTimeout(() => emulatorState.setBlockingMode(undefined), 1500);
            return () => clearTimeout(timer);
        }
    }, [game.over, emulatorState]);

    useEffect(() => {
        if (!loading) {
            return;
        }
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, loading]);

    useEffect(() => {
        if (game.over || loading) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            const direction = DIRECTIONS[e.key];
            if (direction) {
                e.preventDefault();
                setGame((current) => turn(current, direction));
            }
        };
        const gameLoop = setInterval(() => setGame(tick), GAME_SPEED);

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            clearInterval(gameLoop);
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [game.over, loading]);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography sx={{ color: "#2BC903", mb: 1, fontFamily: "monospace" }}>
                SNAKE - Score: {game.score}
            </Typography>
            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: GRID_WIDTH * CELL_SIZE + 4,
                        height: GRID_HEIGHT * CELL_SIZE + 4,
                        border: "2px solid #2BC903"
                    }}
                >
                    <Typography sx={{ color: "#2BC903", fontSize: "1.5em" }}>
                        {countdown}
                    </Typography>
                </Box>
            ) : game.over ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: GRID_WIDTH * CELL_SIZE + 4,
                        height: GRID_HEIGHT * CELL_SIZE + 4,
                        border: "2px solid #ff0606",
                        gap: 2
                    }}
                >
                    <Typography sx={{ color: "#ff0606", fontSize: "2em", fontWeight: "bold" }}>
                        GAME OVER
                    </Typography>
                    <Typography sx={{ color: "#FCFCFC", fontSize: "1.2em" }}>
                        Final Score: {game.score}
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${GRID_WIDTH.toString()}, ${CELL_SIZE.toString()}px)`,
                        gridTemplateRows: `repeat(${GRID_HEIGHT.toString()}, ${CELL_SIZE.toString()}px)`,
                        gap: 0,
                        border: "2px solid #2BC903",
                        width: "fit-content"
                    }}
                >
                    {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, index) => {
                        const x = index % GRID_WIDTH;
                        const y = Math.floor(index / GRID_WIDTH);
                        const snakeIndex = game.snake.findIndex(
                            (segment) => segment.x === x && segment.y === y
                        );
                        const isHead = snakeIndex === 0;
                        const isSnake = snakeIndex !== -1;
                        const isFood = game.food.x === x && game.food.y === y;

                        return (
                            <Box
                                key={index}
                                sx={{
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                    backgroundColor: isSnake
                                        ? "#2BC903"
                                        : isFood
                                          ? "#ff0606"
                                          : "#121212",
                                    border: "1px solid #1a1a1a",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                    color: "#000000",
                                    fontWeight: "bold"
                                }}
                            >
                                {isHead && "• •"}
                            </Box>
                        );
                    })}
                </Box>
            )}
            <Typography sx={{ color: "#FCFCFC", mt: 1, fontSize: "0.9em" }}>
                Use arrow keys to move
            </Typography>
        </Box>
    );
};

export default SnakeGame;
