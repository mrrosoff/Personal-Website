import { useEffect, useState, useRef } from "react";
import { Box, Typography } from "@mui/material";
import EmulatorState from "../../../javascript-terminal/emulator-state/EmulatorState";

type Position = { x: number; y: number };

const GRID_WIDTH = 25;
const GRID_HEIGHT = 12;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 12, y: 6 }];
const INITIAL_DIRECTION: Position = { x: 1, y: 0 };
const GAME_SPEED = 150;

const SnakeGame = ({ emulatorState }: { emulatorState: EmulatorState }) => {
    const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
    const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
    const [food, setFood] = useState<Position>({ x: 18, y: 6 });
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [loading, setLoading] = useState(true);
    const directionRef = useRef(direction);

    const generateFood = (): Position => {
        let newFood: Position;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_WIDTH),
                y: Math.floor(Math.random() * GRID_HEIGHT)
            };
        } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    };

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    useEffect(() => {
        if (gameOver) {
            const timer = setTimeout(() => {
                emulatorState.setBlockingMode(undefined);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [gameOver, emulatorState]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setLoading(false);
        }
    }, [countdown]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameOver || loading) return;

            const key = e.key;
            const currentDir = directionRef.current;

            if (key === "ArrowUp" && currentDir.y === 0) {
                e.preventDefault();
                setDirection({ x: 0, y: -1 });
            } else if (key === "ArrowDown" && currentDir.y === 0) {
                e.preventDefault();
                setDirection({ x: 0, y: 1 });
            } else if (key === "ArrowLeft" && currentDir.x === 0) {
                e.preventDefault();
                setDirection({ x: -1, y: 0 });
            } else if (key === "ArrowRight" && currentDir.x === 0) {
                e.preventDefault();
                setDirection({ x: 1, y: 0 });
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [gameOver, loading]);

    useEffect(() => {
        if (gameOver || loading) return;

        const gameLoop = setInterval(() => {
            setSnake((prevSnake) => {
                const head = prevSnake[0];
                const newHead: Position = {
                    x: head.x + directionRef.current.x,
                    y: head.y + directionRef.current.y
                };

                if (
                    newHead.x < 0 ||
                    newHead.x >= GRID_WIDTH ||
                    newHead.y < 0 ||
                    newHead.y >= GRID_HEIGHT
                ) {
                    setGameOver(true);
                    return prevSnake;
                }

                if (
                    prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
                ) {
                    setGameOver(true);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                if (newHead.x === food.x && newHead.y === food.y) {
                    setScore((prev) => prev + 10);
                    setFood(generateFood());
                    return newSnake;
                }

                newSnake.pop();
                return newSnake;
            });
        }, GAME_SPEED);

        return () => clearInterval(gameLoop);
    }, [gameOver, food, loading]);

    return (
        <Box sx={{ padding: 2 }}>
            <Typography sx={{ color: "#2BC903", mb: 1, fontFamily: "monospace" }}>
                SNAKE - Score: {score}
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
                        {countdown > 0 ? countdown : "GO!"}
                    </Typography>
                </Box>
            ) : gameOver ? (
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
                        Final Score: {score}
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
                        gridTemplateRows: `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`,
                        gap: 0,
                        border: "2px solid #2BC903",
                        width: "fit-content"
                    }}
                >
                    {Array.from({ length: GRID_WIDTH * GRID_HEIGHT }).map((_, index) => {
                        const x = index % GRID_WIDTH;
                        const y = Math.floor(index / GRID_WIDTH);
                        const snakeIndex = snake.findIndex(
                            (segment) => segment.x === x && segment.y === y
                        );
                        const isHead = snakeIndex === 0;
                        const isSnake = snakeIndex !== -1;
                        const isFood = food.x === x && food.y === y;

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
