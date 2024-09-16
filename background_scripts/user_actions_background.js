console.info('Background script runs...');

/**
 * On extension install:
 *  - Clear local storage
 *  - Set default settings
 */
browser.runtime.onInstalled.addListener(async () => {
    let tabSettings = {};
    tabSettings['default'] = {};
    tabSettings['default'].js_mods = true;
    tabSettings['default'].dark_css = false;
    tabSettings['default'].dark_filters = false;
    tabSettings['default'].show_reload_button = false;
    tabSettings['default'].user_script = '';
    await browser.storage.local.clear();
    await browser.storage.local.set({tabSettings: tabSettings});
});

async function get_tab_settings(message, sender, sendResponse) {
    let storage_item;
    storage_item = await browser.storage.local.get("tabSettings");
    // console.log(storage_item, storage_item.length);
    // const MAX_TRIES = 1000;
    // for (let tries = 0; tries < MAX_TRIES; i++) {
    //     if (tries == MAX_TRIES - 1) {
    //         console.error("Couldn't get settings from storage.");
    //         break;
    //     }
    //     storage_item = await browser.storage.local.get("tabSettings");
    //     if (Object.keys(storage_item).length == 0) {
    //         // got an empty object (.get before .set)
    //         continue;
    //     } else {
    //         // got the settings item
    //         break;
    //     }
    // }
    let settings = storage_item.tabSettings;
    let origin = trim_url(sender.origin);
    if (settings[origin] === undefined) {
        settings[origin] = structuredClone(settings['default']);
        await browser.storage.local.set({tabSettings: settings});
    }
    return settings[origin];
}

async function save_user_script(message, sender, sendResponse) {
    let storage_item = await browser.storage.local.get("tabSettings");
    let settings = storage_item.tabSettings;
    let origin = trim_url(sender.origin);
    settings[origin].user_script = message.text;
    await browser.storage.local.set({tabSettings: settings});
    return;
}

async function document_onload(message, sender, sendResponse) {
    // Enable text selection (and change selection color which can be used to hide the selection)
    let text_selection_css = `
    body {user-select: auto;}
    ::selection {color: black !important; background-color: lightblue !important;}
    `;
    browser.tabs.insertCSS({code: text_selection_css});

    // set show_reload_button setting to false
    let storage_item = await browser.storage.local.get("tabSettings");
    let settings = storage_item.tabSettings;
    let origin = trim_url(sender.origin);
    settings[origin].show_reload_button = false;
    await browser.storage.local.set({tabSettings: settings});
    return;
}

async function background_message_handler(message, sender, sendResponse) {
    let handler_lookup = {
        "get_tab_settings": get_tab_settings,
        "save_user_script": save_user_script,
        "document_onload": document_onload
    };
    
    if (!(message.type in handler_lookup)) {
        console.log(`Unrecognised message (of type: ${message.type}) received by background script.`);
        return;
    }
    
    return handler_lookup[message.type](message, sender, sendResponse);
}

browser.runtime.onMessage.addListener(this.background_message_handler);
