console.info('Injected script runs...');

/**
 * Tab settings must be fetched from the background script (tab overseer). 
 * Settings stored in local (sync?) storage so they survive page reloads, etc.
 * 
 * This whole script is only injected once these variables 
 * have been fetched. (thanks Luminous JS)
 */
let user_script_text = (window.settings.user_script.length >= 50) ? 
                        window.settings.user_script.substring(0, 50) + " ..." : window.settings.user_script;
console.info(`Tab's settings:\r\n==============\r\n
    js_mods: ${window.settings.js_mods}\r\n
    dark_css: ${window.settings.dark_css}\r\n
    dark_filters: ${window.settings.dark_filters}\r\n
    show_reload_button: ${window.settings.show_reload_button}\r\n
    user_script: ${(user_script_text === '') ? "None" : '"' + user_script_text + '"'}\r\n`);

/**
 * Disable certain functions as selected by the user.
 * The method is simple, we override prototypes, making them do nothing.
 */
if (window.settings.js_mods) {
    Event.prototype.preventDefault = function(type, listener, options) {/* Do Nothing */};
    // Event.prototype.addEventListener = function(type, listener, options) {/* Do Nothing */};
}

function dark_mode_css() {
    let dark_style_node = document.querySelector("#dark_style");
    if (dark_style_node) {
        dark_style_node.parentElement.removeChild(dark_style_node);
    } else {
        const dark_css = `* {background-color: #1b1b23 !important; color: white !important;}`;
        let s = document.createElement("style");
        s.id = "dark_style";
        s.innerHTML = dark_css;
        (document.head||document.documentElement).appendChild(s);
    }
}

function dark_mode_filters() {
    let filter_overlay_node = document.querySelector("#filter_overlay");
    if (filter_overlay_node) {
        filter_overlay_node.parentElement.removeChild(filter_overlay_node);

        document.querySelectorAll("img").forEach((e)=>{e.style.filter = "none";});
        document.querySelectorAll("video").forEach((e)=>{e.style.filter = "none";});
    } else {
        let d = document.createElement("div");
        d.id = "filter_overlay";
        d.style.position = "fixed";
        d.style.top = "0";
        d.style.left = "0";
        d.style.width = "100%";
        d.style.height = "100%";
        d.style.zIndex = "999999";
        d.style.background = "transparent";
        d.style.pointerEvents = "none";
        d.style.backdropFilter = "invert(100%) hue-rotate(180deg)";
        document.body.appendChild(d);
        
        document.querySelectorAll("img").forEach((e)=>{e.style.filter = "invert(100%) hue-rotate(180deg)";});
        document.querySelectorAll("video").forEach((e)=>{e.style.filter = "invert(100%) hue-rotate(180deg)";});
    }
}

// Dark mode via basic css
if(window.settings.dark_css) {
    dark_mode_css();
}

// Dark mode via css filters
if(window.settings.dark_filters) {
    dark_mode_filters();
}
