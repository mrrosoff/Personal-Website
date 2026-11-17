import type EmulatorState from "../../../emulatorState/EmulatorState";
import { AdminConsoleScreen, MainMenuOption } from "../../../emulatorState/EmulatorState";
import { editText, postAsAdmin, setAdminConsoleError } from "../../console";

export async function handleConfirmSendEmails(
    key: string,
    state: EmulatorState
): Promise<EmulatorState> {
    const mode = state.getAdminConsoleModeOn(AdminConsoleScreen.ConfirmSendEmails);
    const message = mode.marketing?.message ?? "";
    const returnToMainMenu = () => {
        state.setAdminConsoleMode({
            ...mode,
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.SendMarketingEmails
        });
    };

    switch (key) {
        case "ArrowLeft":
        case "ArrowRight":
            state.setAdminConsoleMode({
                ...mode,
                selectedOption: mode.selectedOption === "yes" ? "no" : "yes"
            });
            break;
        case "Enter":
            if (mode.selectedOption === "yes") {
                state.setAdminConsoleMode({ ...mode, loading: true });
                try {
                    await postAsAdmin(state, "/email/send-email", { message });
                } catch (err) {
                    setAdminConsoleError(state, err, "Failed To Send Marketing Emails");
                    break;
                }
            }
            returnToMainMenu();
            break;
        case "Escape":
            returnToMainMenu();
            break;
        default:
            state.setAdminConsoleMode({ ...mode, marketing: { message: editText(message, key) } });
    }

    return state;
}
