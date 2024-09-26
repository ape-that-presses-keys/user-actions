// (() => {

/**
 * Check and set a global guard variable.
 * If this content script is injected into the same page again,
 * it will do nothing next time.
 */
if (window.hasRun === true) {
    console.info('Blocked content script from running again...');
    // return;
} else {
window.hasRun = true;

console.info('Content script runs...');

window.onload = () => {
    /** inform background script that document has loaded (maybe not 1:1 with content/injected scripts running)
     *  - sets the show_reload_button setting to false
     *  - inserts css to enable text selection
     */
    browser.runtime.sendMessage({type: "document_onload"});
};

/**
 * Get this tab's settings from background script
 *  - clone them to the page so the injected script has access;
 *  - store a snapshot of them (todo)
 */
runtime.sendMessage({type: "get_tab_settings"})
    .then((settings) => {
        window.wrappedJSObject.settings = cloneInto(settings, window, {cloneFunctions: true,});

        // Page script (Injected script)
        // let page_script = document.createElement('script');
        // page_script.id = 'user_actions_page_script';
        // page_script.src = browser.runtime.getURL('injected_scripts/injected.js');
        // (document.head||document.documentElement).appendChild(page_script);
        function onExecuted(result) {
            console.log(`We made it green`);
        }
        function onError(error) {
            console.log(`Error: ${error}`);
        }
        const makeItGreen = 'Event.prototype.preventDefault = function(type, listener, options) {console.info("..."); /* Do Nothing */};';
        const executing = browser.tabs.executeScript({
            code: makeItGreen, runAt: "document_start",
        });
        executing.then(onExecuted, onError);

        // User script
        if(settings.user_script !== '') {
            let user_script = document.createElement('script');
            user_script.id = 'user_script';
            user_script.innerHTML = settings.user_script;
            // user_script.src = browser.runtime.getURL(`user_scripts/${window.origin.substring(8)}.js`);
            (document.head||document.documentElement).appendChild(user_script);
        }
    });

/**
 * Toggle disabling JS mods (disables .preventDefault())
 * 
 * Only affects new listeners as they are added, so reloading the page 
 * is a good option (we must show a button for this).
 */
function toggle_js_mods(message, sender, sendResponse) {

}

function reload_page(message, sender, sendResponse) {
    window.location.reload(true);
}

function save_and_close_user_script_clicked () {
    document.querySelector("#edit_script_overlay").style.display = "none";
    let text = document.querySelector("#edit_script_overlay > div > textarea").value;
    browser.runtime.sendMessage({type: "save_user_script", text: text});
}

// show editing overlay on page
function edit_user_script(message, sender, sendResponse) {
    if (document.querySelector("#edit_script_overlay") == null) {
        let d = document.createElement("div");
        d.id = "edit_script_overlay";
        d.style.position = "fixed";
        d.style.top = "5%";
        d.style.left = "5%";
        d.style.width = "90%";
        d.style.height = "90%";
        d.style.overflow = "scroll";
        d.style.zIndex = "999999";
        d.style.background = "#1b1b23";
        d.style.color = "white";
        d.style.borderRadius = "5px";
        d.style.padding = "10px";
        d = document.body.appendChild(d);
        
        let d2 = document.createElement("div");
        d2.style.position = "relative";
        d2.style.width = "100%";
        d2.style.height = "100%";
        d2 = d.appendChild(d2);
        
        let x = document.createElement("span");
        x.innerHTML = "&nbsp;Save & Close&nbsp;";
        x.style.background = "green";
        x.style.borderRadius = "3px";
        x.style.padding = "1px 3px";
        x.style.position = "fixed";
        x.style.top = "7%";
        x.style.right = "5%";
        x.style.cursor = "pointer";
        x.onclick = () => {save_and_close_user_script_clicked();};
        d2.appendChild(x);

        let t = document.createElement("textarea");
        t.style.width = "100%";
        t.style.height = "100%";
        t.style.background = "transparent";
        t.style.color = "white";
        t.style.borderRadius = "5px";
        t.style.border = "none";
        t.style.outline = "none";
        t.placeholder = "userScript code goes here...";
        t.value = message.script_text;
        d2.appendChild(t);
    } else {
        document.querySelector("#edit_script_overlay").style.display = "block";
    }
}

/**
 * Listen for messages from the background script or popup.
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let handler_lookup = {
        "reload_page": reload_page,
        "toggle_js_mods": toggle_js_mods,
        "toggle_dark_css": window.wrappedJSObject.dark_mode_css,
        "toggle_dark_filters": window.wrappedJSObject.dark_mode_filters,
        "edit_user_script": edit_user_script
    };

    if (message.type in handler_lookup) {
        return handler_lookup[message.type](message, sender, sendResponse);
    } else {
        console.log(`Unrecognised message (of type: ${message.type}) received by content script.`);
        return;
    }
});

}
// })(window);
