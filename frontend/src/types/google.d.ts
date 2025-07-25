declare namespace google.accounts.id {
    interface CredentialResponse {
        credential: string;
        select_by?: string;
        clientId?: string;
    }

    function initialize(options: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        prompt_parent_id?: string;
    }): void;

    function renderButton(
        parent: HTMLElement | null,
        options: {
            theme?: "outline" | "filled_blue" | "filled_black";
            size?: "small" | "medium" | "large";
            type?: "standard" | "icon";
            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
            shape?: "rectangular" | "pill" | "circle" | "square";
            logo_alignment?: "left" | "center";
            width?: number;
            locale?: string;
        }
    ): void;

    function prompt(
        momentListener?: (notification: PromptMomentNotification) => void
    ): void;

    interface PromptMomentNotification {
        isDisplayMoment: () => boolean;
        isDisplayed: () => boolean;
        isNotDisplayed: () => boolean;
        getNotDisplayedReason: () => string;
        isSkippedMoment: () => boolean;
        getSkippedReason: () => string;
        isDismissedMoment: () => boolean;
        getDismissedReason: () => string;
    }
}

interface Window {
    google: typeof google;
}
