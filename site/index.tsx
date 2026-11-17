import React from "react";
import ReactDOM from "react-dom/client";

import App from "./components/App";
import ErrorBoundary from "./components/error-boundary/ErrorBoundary";

const root = document.getElementById("root");
if (!root) {
    throw Error("Missing Root Element");
}

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);
