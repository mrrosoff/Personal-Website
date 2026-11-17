import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithApp } from "../../../../helpers/render";
import { mockEmulatorState } from "../../../../helpers/terminal";

import SnakeGame, { BOARD, TICK_MS } from "../../../../../site/components/terminal/games/SnakeGame";

vi.unmock("../../../../../site/components/terminal/games/SnakeGame");

function foodAt(...cells: [number, number][]) {
    const values = cells.flatMap(([x, y]) => [(x + 0.5) / BOARD.width, (y + 0.5) / BOARD.height]);
    vi.spyOn(Math, "random").mockImplementation(() => values.shift() ?? 0);
}

function tick(ms: number) {
    for (let elapsed = 0; elapsed < ms; elapsed += TICK_MS) {
        act(() => void vi.advanceTimersByTime(Math.min(TICK_MS, ms - elapsed)));
    }
    act(() => void vi.advanceTimersByTime(0));
}

function countDown() {
    for (let second = 0; second < 3; second++) {
        act(() => void vi.advanceTimersByTime(1000));
    }
    act(() => void vi.advanceTimersByTime(0));
}

function press(key: string) {
    fireEvent.keyDown(window, { key });
}

function startGame() {
    const emulatorState = mockEmulatorState();
    emulatorState.setBlockingMode({});
    renderWithApp(<SnakeGame />, { emulatorState });
    countDown();
    return emulatorState;
}

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("SnakeGame", () => {
    it("should count down before starting", () => {
        renderWithApp(<SnakeGame />);

        expect(screen.getByText("3")).toBeInTheDocument();
        act(() => void vi.advanceTimersByTime(1000));
        expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("should ignore keys during the countdown", () => {
        renderWithApp(<SnakeGame />);

        press("ArrowUp");
        countDown();
        tick(TICK_MS);

        expect(screen.getByText("• •")).toBeInTheDocument();
    });

    it("should score for eating food", () => {
        foodAt([2, 2]);
        startGame();

        tick(TICK_MS * 6);

        expect(screen.getByText("SNAKE - Score: 10")).toBeInTheDocument();
    });

    it("should end the game at a wall and hand the terminal back", () => {
        const emulatorState = startGame();

        press("ArrowUp");
        tick(TICK_MS * 7);

        expect(screen.getByText("GAME OVER")).toBeInTheDocument();
        press("ArrowDown");
        tick(1500);
        expect(emulatorState.getBlockingMode()).toBeUndefined();
    });

    it("should keep going straight on other keys", () => {
        startGame();

        press("a");
        tick(TICK_MS * 13);

        expect(screen.getByText("GAME OVER")).toBeInTheDocument();
    });

    it("should not reverse straight into itself", () => {
        startGame();

        press("ArrowLeft");
        press("ArrowDown");
        press("ArrowUp");
        press("ArrowRight");
        press("ArrowLeft");
        tick(TICK_MS);

        expect(screen.queryByText("GAME OVER")).not.toBeInTheDocument();
    });

    it("should end the game when it runs into itself", () => {
        foodAt([18, 6], [19, 6], [20, 6], [21, 6], [0, 0]);
        startGame();

        tick(TICK_MS * 9);
        press("ArrowDown");
        tick(TICK_MS);
        press("ArrowLeft");
        tick(TICK_MS);
        press("ArrowUp");
        tick(TICK_MS);

        expect(screen.getByText("GAME OVER")).toBeInTheDocument();
        expect(screen.getByText("Final Score: 40")).toBeInTheDocument();
    });

    it("should end the game at the left, top and bottom walls", () => {
        startGame();
        press("ArrowDown");
        tick(TICK_MS * BOARD.height);

        expect(screen.getByText("GAME OVER")).toBeInTheDocument();
    });

    it("should end the game at the left wall", () => {
        startGame();
        press("ArrowUp");
        tick(TICK_MS);
        press("ArrowLeft");
        tick(TICK_MS * BOARD.width);

        expect(screen.getByText("GAME OVER")).toBeInTheDocument();
    });
});
