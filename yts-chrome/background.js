let contentScriptLoaded = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "contentScriptLoaded") {
    contentScriptLoaded = true;
    sendResponse({status: "Content script loaded"});
  } else if (request.action === "extractSubtitles") {
    if (!contentScriptLoaded) {
      sendResponse({ error: "Content script not loaded yet. Please refresh the page and try again." });
    } else {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "extractSubtitles"}, (response) => {
          sendResponse(response);
        });
      });
    }
  }
  return true;  // Indicates that the response is asynchronous
});
