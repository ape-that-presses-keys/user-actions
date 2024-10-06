console.info('Background script runs...');

import { trim_url } from "/common_scripts/common.mjs";

/**
 * On extension install:
 *  - Clear (local) storage
 *  - Set default settings
 */
chrome.runtime.onInstalled.addListener(async () => {
    let tabSettings = {};
    tabSettings['default'] = {};
    tabSettings['default'].js_mods = true;
    tabSettings['default'].dark_css = false;
    tabSettings['default'].dark_filters = false;
    tabSettings['default'].show_reload_button = false;
    tabSettings['default'].user_script = '';
    await chrome.storage.local.clear();
    await chrome.storage.local.set({tabSettings: tabSettings});
});

function get_tab_settings(message, sender, sendResponse) {
    chrome.storage.local.get("tabSettings")
    .then(({tabSettings}) => {
        let origin = trim_url(sender.origin);
        if (tabSettings[origin] === undefined) {
            tabSettings[origin] = structuredClone(tabSettings['default']);
            chrome.storage.local.set(tabSettings)
            .then(() => {
                sendResponse(tabSettings[origin]);
            });
        } else {
            tabSettings[origin].show_reload_button = false; // reload button should be hidden on_load, i.e. when get_tab_settings is called
            sendResponse(tabSettings[origin]);
        }
    });

    // Enable text selection (and change selection color which can be used to hide the selection)
    let text_selection_css = `
    body {user-select: auto;}
    ::selection {color: black !important; background-color: lightblue !important;}
    `;
    chrome.scripting.insertCSS({
        target: {tabId: sender.tab.id},
        css: text_selection_css,
        origin: "USER"
    });

    return true;
}

function save_user_script(message, sender, sendResponse) {
    chrome.storage.local.get("tabSettings")
    .then(({tabSettings}) => {
        let origin = trim_url(sender.origin);
        tabSettings[origin].user_script = message.text;
        chrome.storage.local.set(tabSettings);
    });
}

function test_handler(message, sender, sendResponse) {
    // Enable text selection (and change selection color which can be used to hide the selection)
    let text_selection_css = `
    body {user-select: auto;}
    ::selection {color: black !important; background-color: lightblue !important;}
    `;
    chrome.scripting.insertCSS({
        target: {tabId: sender.tab.id},
        css: text_selection_css,
        origin: "USER"
    });

    chrome.storage.local.get("tabSettings")
    .then(({tabSettings}) => {
        let origin = trim_url(sender.origin);
        if (tabSettings[origin] === undefined) {
            tabSettings[origin] = structuredClone(tabSettings['default']);
            chrome.storage.local.set(tabSettings)
            .then(() => {
                return tabSettings[origin];
            });
        } else {
            tabSettings[origin].show_reload_button = false; // reload button should be hidden on_load, i.e. when get_tab_settings is called
            return tabSettings[origin];
        }
    });
}

function background_message_handler(message, sender, sendResponse) {
    console.log(`Background script got:`);
    console.log(message);
    
    let handler_lookup = {
        "get_tab_settings": get_tab_settings,
        "save_user_script": save_user_script,
        "test": get_tab_settings
        // "test": test_handler
    };
    
    // if (!(message.type in handler_lookup)) {
    //     console.log(`Unrecognised message (of type: ${message.type}) received by background script.`);
    //     return;
    // }

    let handler;
    try {
        handler = handler_lookup[message.type];
    } catch (error) {
        console.error(error);
        return;
    }
    
    return handler(message, sender, sendResponse);
}

chrome.runtime.onMessage.addListener(background_message_handler);
