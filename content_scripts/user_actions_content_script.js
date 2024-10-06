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

/**
 * Messaging with injected page script
 */
// message from page script
window.addEventListener('to-content-event', (event) => {
    const eventData = event.detail;
    console.log(`Content script got (from injected script):`);
    console.log(eventData);
    // message to background script
    chrome.runtime.sendMessage(eventData)
    .then((reply) => {
        // message from background script
        console.log(`Content script got (from background script):`);
        console.log(reply);
        // message to page script
        const customEvent = new CustomEvent('to-page-event', {
            detail: reply
        });
        window.dispatchEvent(customEvent);
    });
});

function reload_page(message, sender, sendResponse) {
    window.location.reload(true);
}

function save_and_close_user_script_clicked () {
    document.querySelector("#edit_script_overlay").style.display = "none";
    let text = document.querySelector("#edit_script_overlay > div > textarea").value;
    chrome.runtime.sendMessage({type: "save_user_script", text: text});
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`Content script got (from background script):`);
    console.log(message);
    
    let handler_lookup = {
        "reload_page": reload_page,
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
