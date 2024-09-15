console.info('Background script runs...');

function trim_url(url) {
    let httpsIndex = url.indexOf("https://");
	if (httpsIndex != -1)
		url = url.substring(httpsIndex+8);
	let slashIndex = url.indexOf("/");
    if (slashIndex != -1)
		url = url.substring(0, slashIndex);
    return url;
}

/**
 * On extension install:
 *  - Clear local storage
 *  - Set default settings
 */
browser.runtime.onInstalled.addListener(async () => {
    function setOkay () {
        console.info("tabSettings set okay");
    }
    function setError (e) {
        console.log(e);
    }
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
    while (true) {
        storage_item = await browser.storage.local.get("tabSettings");
        if (Object.keys(storage_item).length == 0) {
            // console.log("not set yet");
            continue;
        } else {
            break;
        }
    }
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
    console.log("document_onload received");

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
