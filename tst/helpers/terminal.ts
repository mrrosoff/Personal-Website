import commands from "../../site/javascript-terminal/commands";
import Emulator from "../../site/javascript-terminal/emulator";
import EmulatorState, {
    type AdminConsoleState
} from "../../site/javascript-terminal/emulator-state/EmulatorState";
import { mockFileSystem } from "../__mocks__/__data__/fileSystem";

export function mockEmulatorState(
    environmentVariables: Record<string, string> = {}
): EmulatorState {
    return EmulatorState.create({
        fs: mockFileSystem(),
        commandMapping: commands,
        environmentVariables: { cwd: "/", ...environmentVariables }
    });
}

export function mockAdminState(
    mode: AdminConsoleState,
    environmentVariables: Record<string, string> = { AUTH_TOKEN: "token" }
): EmulatorState {
    const state = mockEmulatorState(environmentVariables);
    state.setAdminConsoleMode(mode);
    return state;
}

export function mockShell(environmentVariables: Record<string, string> = {}) {
    const emulator = new Emulator();
    const state = mockEmulatorState(environmentVariables);

    function results(command: string) {
        emulator.execute(state, command, "Command Not Found");
        return state.getOutputs().at(-1)?.output ?? [];
    }

    function run(command: string): string {
        return results(command)
            .map((result) => result.output)
            .join("\n");
    }

    return { emulator, state, results, run };
}
