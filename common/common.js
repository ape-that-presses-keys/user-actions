function trim_url(url) {
    if (url.includes("://")) {
        url = url.substring(url.indexOf("://") + 3); // Remove protocol and "://"
    }
    if (url.includes("/")) {
        url = url.substring(0, url.indexOf("/")); // Remove everything after the first slash
    }
    return url;
}
