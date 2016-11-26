// Finds which interface script to use
function load() {
  const urls = {
    gmusic: 'play.google.com/music',
    pandora: 'pandora.com',
    songza: 'songza.com',
    spotify: 'play.spotify.com'
  };

  const backgroundPort = chrome.runtime.connect({ name: 'loader' });
  for (const protocol of urls) {
    if (urls.hasOwnProperty(protocol) && document.URL.search(urls[protocol]) > 0) {
      backgroundPort.postMessage({ protocol });
    }
  }
}

load();
