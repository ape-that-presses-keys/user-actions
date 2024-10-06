Features
========
- works on a per website customizable basis
- basic CSS dark mode
- CSS filters dark mode
- user scripts
- enables:
	- text selection
	- right click
	- should enable all normal actions, without breaking sites

- Reddit FFS they wont serve images without html

MV3 Migration
=============
- Background
	Convert background pages to be non-persistent.
<!-- - CSP
	Move the extension’s CSP to the manifest.json key content_security_policy.extension_pages 
	and update the CSP to conform to Manifest V3 requirements. -->
- Unsafe eval strings
	Move any arbitrary strings executed as scripts to files and update your code to use the Scripting API.

Issues
======
- NB!! I'm using an old injection method, there are easier ways. We can inject content scripts (even to page context) straight from the background script.

- upload to version control
- package for distribution
- multi-browser support
- user scripts need url pattern matching or similar, not site wide...
- stop custom keybinding that breaks things, like a site stopping F12
- touch events aren't clicks, handle differently?


code to add
---
window.all = document.querySelectorAll("*");
window.all.forEach(e => {
	e.style.userSelect = "text";
	e.onselectstart = null;
});
document.onselectstart = null;

document.documentElement.onclick = null;
document.documentElement.onmousedown = null;
document.documentElement.onselectstart = null;
document.onclick = null;
document.onmousedown = null;
document.onselectstart = null;
document.documentElement.replaceWith(document.documentElement.cloneNode(true));

document.onmousedown=null;
document.onclick=null;
document.oncontextmenu=null;
