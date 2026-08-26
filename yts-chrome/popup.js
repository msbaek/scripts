document.addEventListener('DOMContentLoaded', () => {
  const extractButton = document.getElementById('extractButton');
  const statusElement = document.getElementById('status');

  extractButton.addEventListener('click', () => {
    statusElement.textContent = "Extracting subtitles...";
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs.length === 0) {
        statusElement.textContent = "Error: No active tab found";
        return;
      }
      
      const activeTab = tabs[0];
      if (!activeTab.url.includes("youtube.com/watch")) {
        statusElement.textContent = "Error: Not a YouTube video page";
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, {action: "extractSubtitles"}, (response) => {
        if (chrome.runtime.lastError) {
          statusElement.textContent = `Error: ${chrome.runtime.lastError.message}`;
          return;
        }
        if (response.error) {
          statusElement.textContent = `Error: ${response.error}`;
        } else if (response.subtitles) {
          navigator.clipboard.writeText(response.subtitles).then(() => {
            statusElement.textContent = "Subtitles copied to clipboard!";
          }).catch((err) => {
            statusElement.textContent = `Error copying to clipboard: ${err}`;
          });
        } else {
          statusElement.textContent = "Unknown error occurred";
        }
      });
    });
  });
});
