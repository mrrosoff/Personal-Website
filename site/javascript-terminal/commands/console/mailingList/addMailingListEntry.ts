import { validate } from "email-validator";

import type { MailingListRegistration } from "../../../../../api/types";
import { registerMailingListUser } from "../../../../components/ice-cream/MailingList";
import type EmulatorState from "../../../emulator-state/EmulatorState";
import { AdminConsoleScreen, MainMenuOption } from "../../../emulator-state/EmulatorState";
import { arrowStep, editText, setAdminConsoleError, stepAround } from "../../console";

const MAILING_LIST_FIELDS: (keyof MailingListRegistration)[] = ["firstName", "lastName", "email"];

export async function handleAddMailingListEntry(
    key: string,
    state: EmulatorState
): Promise<EmulatorState> {
    const mode = state.getAdminConsoleModeOn(AdminConsoleScreen.AddMailingListEntry);
    const entry = mode.mailingListEntry;

    if (key === "Escape" || (entry.added && key === "Enter")) {
        state.setAdminConsoleMode({
            ...mode,
            screen: AdminConsoleScreen.Main,
            selectedOption: MainMenuOption.AddMailingListEntry,
            mailingListEntry: undefined
        });
        return state;
    }

    if (entry.added) {
        return state;
    }

    switch (key) {
        case "ArrowDown":
        case "ArrowUp":
        case "Tab":
            state.setAdminConsoleMode({
                ...mode,
                mailingListEntry: {
                    ...entry,
                    currentField: stepAround(
                        MAILING_LIST_FIELDS,
                        entry.currentField,
                        arrowStep(key)
                    )
                }
            });
            break;
        case "Enter":
            if (!validate(entry.email.trim())) {
                state.setAdminConsoleMode({ ...mode, error: "Enter A Valid Email Address" });
                break;
            }
            state.setAdminConsoleMode({ ...mode, loading: true });
            try {
                await registerMailingListUser(entry);
            } catch (err) {
                setAdminConsoleError(state, err, "Failed To Add To Mailing List");
                break;
            }
            state.updateAdminConsoleMode({
                mailingListEntry: { ...entry, added: true },
                loading: false
            });
            break;
        default:
            state.setAdminConsoleMode({
                ...mode,
                mailingListEntry: {
                    ...entry,
                    [entry.currentField]: editText(entry[entry.currentField], key)
                }
            });
    }

    return state;
}
