function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

function extractSubtitles() {
  const videoId = getVideoId();
  if (!videoId) {
    return { error: "Could not find video ID" };
  }

  const player = document.querySelector("#movie_player");
  if (!player) {
    return { error: "Could not find video player" };
  }

  const subtitles = player.getSubtitlesTrack();
  if (!subtitles || subtitles.length === 0) {
    return { error: "No subtitles available" };
  }

  const formattedSubtitles = subtitles
    .map((entry) => {
      const startTime = new Date(entry.startTime * 1000)
        .toISOString()
        .substr(11, 8);
      return `${startTime} - ${entry.text}`;
    })
    .join("\n");

  return { subtitles: formattedSubtitles };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractSubtitles") {
    const result = extractSubtitles();
    sendResponse(result);
  }
});

function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

function extractSubtitles() {
  return new Promise((resolve, reject) => {
    const videoId = getVideoId();
    if (!videoId) {
      reject("Could not find video ID");
      return;
    }

    const player = document.querySelector('#movie_player');
    if (!player) {
      reject("Could not find video player");
      return;
    }

    // YouTube의 자막 API에 직접 접근
    if (typeof player.getPlayerResponse === 'function') {
      const playerResponse = player.getPlayerResponse();
      const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      
      if (captionTracks && captionTracks.length > 0) {
        const firstTrack = captionTracks[0];
        fetch(firstTrack.baseUrl)
          .then(response => response.text())
          .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const textElements = xmlDoc.getElementsByTagName("text");
            
            let formattedSubtitles = "";
            for (let i = 0; i < textElements.length; i++) {
              const start = parseFloat(textElements[i].getAttribute("start"));
              const duration = parseFloat(textElements[i].getAttribute("dur"));
              const text = textElements[i].textContent;
              
              const startTime = new Date(start * 1000).toISOString().substr(11, 8);
              formattedSubtitles += `${startTime} - ${text}\n`;
            }
            
            resolve({ subtitles: formattedSubtitles });
          })
          .catch(error => reject(`Error fetching subtitles: ${error}`));
      } else {
        reject("No caption tracks found");
      }
    } else {
      reject("Could not access player response");
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractSubtitles") {
    extractSubtitles()
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.toString() }));
    return true;  // Indicates that the response is asynchronous
  }
});

