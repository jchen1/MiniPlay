// Finds which interface script to use, and store global enums

const RepeatEnum = {
  NONE: 0,
  ONE: 1,
  ALL: 2
}

const ThumbEnum = {
  NONE: 0,
  UP: 5,
  DOWN: 1
}

$(function() {
  var urls = {
    gmusic: "play.google.com/music",
    pandora: "pandora.com",
    songza: "songza.com",
    spotify: "play.spotify.com"
  };

  var background_port = chrome.runtime.connect({name: "loader"});
  for (var protocol in urls) {
    if (urls.hasOwnProperty(protocol) && document.URL.search(urls[protocol]) > 0) {
      background_port.postMessage({"protocol": protocol});
    }
  }
});
