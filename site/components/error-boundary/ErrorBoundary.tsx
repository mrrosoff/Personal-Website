import { Component, type ErrorInfo, type ReactNode } from "react";

import CrashScreen from "./CrashScreen";

export default class ErrorBoundary extends Component<
    { children: ReactNode; fallback?: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? <CrashScreen />;
        }

        return this.props.children;
    }
}
