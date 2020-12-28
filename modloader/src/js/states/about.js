export class AboutModloaderState extends shapezAPI.exports.TextualGameState {
    constructor() {
        super("AboutModloaderState");
        /* typehist:start */
        this.htmlElement = "";
        /* typehints:end */
    }

    getStateHeaderTitle() {
        return "About modloader";
    }

    getMainContentHTML() {
        return `
            <div class="head">
                <img src="${shapezAPI.exports.cachebust("res/logo.png")}" alt="shapez.io Logo">
            </div>
            <div class="text">
            This is the about page for the modloader
            </div>
        `;
    }

    onEnter() {}

    getDefaultPreviousState() {
        return "SettingsState";
    }
}

shapezAPI.exports.SettingsState.trackClicks.push({
    htmlElement: ".aboutModloader",
    state: "AboutModloaderState",
    options: {
        preventDefault: false,
    },
});

shapezAPI.exports.SettingsState.getMainContentHTML = self => {
        return `<div class="sidebar">
        ${self.getCategoryButtonsHtml()}

        ${
            self.app.platformWrapper.getSupportsKeyboard()
                ? `
        <button class="styledButton categoryButton editKeybindings">
        ${shapezAPI.translations.keybindings.title}
        </button>`
                : ""
        }

        <div class="other">
            <button class="styledButton aboutModloader">About modloader</button>
        </div>

        <div class="other">
            <button class="styledButton about">${shapezAPI.translations.about.title}</button>

            <div class="versionbar">
                <div class="buildVersion">${shapezAPI.translations.global.loading} ...</div>
            </div>
        </div>
    </div>

    <div class="categoryContainer">
        ${self.getSettingsHtml()}
    </div>

    `;
};