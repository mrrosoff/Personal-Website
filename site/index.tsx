import React from "react";
import ReactDOM from "react-dom/client";

import App from "./components/App";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary";
import { COLORS } from "./theme";

const root = document.getElementById("root");
if (!root) {
    throw Error("Missing Root Element");
}

const CONE = String.raw`
   .-"""-.
  /       \
 (_________)
  \/\/\/\/\/
   \/\/\/\/
    \/\/\/
     \/\/
      \/`.split("\n");

const SCREEN = String.raw`
 .--------------------.
 | dev@rosoff:~$ _    |
 |                    |
 |                    |
 '--------------------'
     ____|____|____

`.split("\n");

const ART = SCREEN.map((line, index) => `${line.padEnd(26)}${CONE[index]}`).join("\n");

console.log(
    `%c${ART}%c\n\nThis site runs in your terminal too: %ccurl -L maxrosoff.com%c\n\nSource: https://github.com/mrrosoff/Personal-Website`,
    `color: ${COLORS.green}; font: 14px monospace`,
    "font: 12px monospace",
    `background: ${COLORS.green}; color: ${COLORS.background}; font: bold 12px monospace; padding: 2px 6px; border-radius: 4px`,
    "font: 12px monospace"
);

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
