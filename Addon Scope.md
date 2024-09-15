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

Issues
======
- upload to version control
- package for distribution
- multi-browser support


code to add
---
window.all = document.querySelectorAll("*");
window.all.forEach(e => {
	e.style.userSelect = "text";
	e.onselectstart = null;
};
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
