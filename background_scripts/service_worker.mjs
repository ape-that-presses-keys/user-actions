try {
    // This is the file produced by webpack
    importScripts("/background_scripts/user_actions_background.mjs");
} catch (e) {
    // This will allow you to see error logs during registration/execution
    console.error(e);
}