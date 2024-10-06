console.info('Popup script runs...');

import { trim_url } from "/common_scripts/common.mjs";

/** Gets a single element from the css selector;
 *  If bool_enable_disable is true, add enabled and remove disabled 
 *  from the element's classList and vice versa.
*/
function element_dis_enabler(element_css_selector, bool_enable_disable) {
    let ele = document.querySelector(element_css_selector);
    if (bool_enable_disable) {
        ele.classList.remove("disabled");
        ele.classList.add("enabled");
    } else {
        ele.classList.add("disabled");
        ele.classList.remove("enabled");
    }
}

function update_popup_ui(settings) {
    element_dis_enabler("#toggle_js_mods", settings.js_mods);
    element_dis_enabler("#toggle_dark_css", settings.dark_css);
    document.querySelector("#toggle_dark_css").title = (settings.dark_css) ? "Disable basic CSS dark mode" : "Enable basic CSS dark mode";
    element_dis_enabler("#toggle_dark_filters", settings.dark_filters);
    document.querySelector("#toggle_dark_filters").title = (settings.dark_filters) ? "Disable dark mode via CSS filters" : "Enable dark mode via CSS filters";
    reload_button.classList = (settings.show_reload_button) ? "" : "hidden";
}

/**
 * When popup is opened:
 *  - get settings for this tab from storage and update popup elements accordingly
 */
window.onload = function() {
    // add onclick for reload button
    document.querySelector("#reload_button").onclick = () => {reload_button_clicked();};

    chrome.storage.local.get("tabSettings")
        .then(async (storage_item) => {
            chrome.tabs
                .query({ active: true, currentWindow: true })
                .then(async (tabs) => {
                    // enabled / disabled style for popup menu items
                    tabs[0].origin = trim_url(tabs[0].url);
                    let settings = storage_item.tabSettings[tabs[0].origin];
                    update_popup_ui(settings);
                    // show origin url
                    document.querySelector("#title").innerText = tabs[0].origin;
                });
        });
}

function reload_button_clicked() {
    chrome.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {type: "reload_page"});
        });
    document.querySelector("#reload_button").classList = "hidden";
}

// Toggle the modding of js functions
async function toggle_js_mods(tabs) {
    chrome.storage.local.get("tabSettings")
        .then(async (storage_item) => {
            let settings = storage_item.tabSettings[tabs[0].origin];
            settings.js_mods = !settings.js_mods;
            settings.show_reload_button = !settings.show_reload_button;
            update_popup_ui(settings);
            await chrome.storage.local.set({tabSettings: storage_item.tabSettings});
        });
}

// Toggle dark CSS on active tab.
function toggle_dark_css(tabs) {
    chrome.storage.local.get("tabSettings")
        .then(async (storage_item) => {
            let settings = storage_item.tabSettings[tabs[0].origin];
            settings.dark_css = !settings.dark_css;
            update_popup_ui(settings);
            chrome.tabs
                .query({ active: true, currentWindow: true })
                .then((tabs) => {chrome.tabs.sendMessage(tabs[0].id, {type: "toggle_dark_css"});});
            await chrome.storage.local.set({tabSettings: storage_item.tabSettings});
        });
}

// Toggle dark filters on active tab.
function toggle_dark_filters(tabs) {
    chrome.storage.local.get("tabSettings")
        .then(async (storage_item) => {
            let settings = storage_item.tabSettings[tabs[0].origin];
            settings.dark_filters = !settings.dark_filters;
            update_popup_ui(settings);
            chrome.tabs
                .query({ active: true, currentWindow: true })
                .then((tabs) => {chrome.tabs.sendMessage(tabs[0].id, {type: "toggle_dark_filters"});});
            await chrome.storage.local.set({tabSettings: storage_item.tabSettings});
        });
}

// Message context script to show user script editor
function edit_user_script(tabs) {
    chrome.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
            //fetch existing user script text
            chrome.storage.local.get("tabSettings")
                .then((storage_item) => {
                    let settings = storage_item.tabSettings[trim_url(tabs[0].url)];
                    // message context script
                    chrome.tabs.sendMessage(tabs[0].id, {type: "edit_user_script", script_text: settings.user_script});
                });
        });
}

// Just log the error to the console.
function reportError(error) {
    console.error(`user_actions: ${error}`);
}

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
*/
function popupClickHandler(e) {
    let handler_lookup = {
        "toggle_js_mods": toggle_js_mods,
        "toggle_dark_css": toggle_dark_css,
        "toggle_dark_filters": toggle_dark_filters,
        "edit_user_script": edit_user_script
    };

    if (!(e.target.id in handler_lookup)) {
        console.log(`Unrecognised click event (to ${e.target}) received by popup script.`);
        return;
    }

    chrome.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
            tabs[0].origin = trim_url(tabs[0].url);
            handler_lookup[e.target.id](tabs);
        })
        .catch(reportError);
}
document.addEventListener("click", popupClickHandler);
