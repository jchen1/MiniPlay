//background tab, always running

chrome.storage.local.set({ last_notification: "" });

var interface_port = null,
  popup_port = null;
var loader_ports = {};

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name == "loader") {
    port.id = port.sender.tab.id;
    loader_ports[port.id] = port;
    port.onMessage.addListener(function (msg) {
      if (msg.protocol) {
        chrome.tabs.executeScript(port.id, { file: "scripts/enums.js" });
        chrome.tabs.executeScript(port.id, {
          file: "scripts/protocols/global.js",
        });
        chrome.tabs.executeScript(port.id, {
          file: "scripts/protocols/" + msg.protocol + "/constants.js",
        });
        chrome.tabs.executeScript(port.id, {
          file: "scripts/protocols/" + msg.protocol + "/status.js",
        });
        chrome.tabs.executeScript(port.id, {
          file: "scripts/protocols/" + msg.protocol + "/interface.js",
        });
      }
    });
    port.onDisconnect.addListener(function () {
      loader_ports[port.id] = null;
    });
  }
  if (port.name == "interface" && !interface_port) {
    interface_port = port;
    interface_port.id = port.sender.tab.id;
    port.onMessage.addListener(function (msg) {
      if (msg.scrobble == true) {
        scrobble(msg.oldValue);
      }
      if (msg.notify == true) {
        create_notification(msg.newValue);
        now_playing(msg.newValue);
      }
    });
    if (popup_port) {
      popup_port.postMessage({ type: "connect", id: interface_port.id });
    }

    port.onDisconnect.addListener(function () {
      interface_port = null;
    });
  } else if (port.name == "popup") {
    popup_port = port;
    port.onDisconnect.addListener(function () {
      popup_port = null;
    });
    if (interface_port) {
      popup_port.postMessage({ type: "connect", id: interface_port.id });
    }
  }
});

function notify_helper(details, url) {
  chrome.notifications.create(
    "",
    {
      type: "basic",
      title: details.title,
      message: details.artist,
      contextMessage: details.album,
      iconUrl: url,
      buttons: [
        {
          title: "Play/Pause",
          iconUrl: "img/notification_pp.png",
        },
        {
          title: "Next song",
          iconUrl: "img/notification_ff.png",
        },
      ],
    },
    function (id) {
      chrome.storage.local.get("last_notification", function (data) {
        if (data["last_notification"]) {
          chrome.notifications.clear(
            data["last_notification"],
            function (cleared) {}
          );
        }
        chrome.storage.local.set({ last_notification: id });
      });
    }
  );
}

function create_notification(details) {
  chrome.storage.sync.get("notifications-enabled", function (ans) {
    if (ans["notifications-enabled"] === true) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", details.album_art);
      xhr.responseType = "blob";
      xhr.onload = function () {
        notify_helper(details, window.URL.createObjectURL(this.response));
      };
      xhr.onerror = function () {
        notify_helper(details, "img/default_album.png");
      };
      xhr.send(null);
    }
  });
}

chrome.notifications.onClicked.addListener(function (id) {
  chrome.storage.local.get("lastfm_fail_id", function (data) {
    if (data["lastfm_fail_id"] === id) {
      chrome.tabs.create({ url: chrome.extension.getURL("options.html") });
    } else if (interface_port) {
      chrome.tabs.update(interface_port.id, { highlighted: true });
    }
  });
});

chrome.notifications.onButtonClicked.addListener(function (id, buttonIndex) {
  chrome.storage.local.get("last_notification", function (data) {
    if (data["last_notification"] == id && interface_port) {
      switch (buttonIndex) {
        case 0: // Play/Pause
          interface_port.postMessage({ action: "send_command", type: "play" });
          break;
        case 1: // Next
          interface_port.postMessage({ action: "send_command", type: "ff" });
          break;
      }
    }
  });
});

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == "install") {
    chrome.storage.sync.get(
      ["notifications-enabled", "shortcuts-enabled", "scrobbling-enabled"],
      function (data) {
        if (data["notifications-enabled"] === undefined) {
          chrome.storage.sync.set({ "notifications-enabled": true });
        }
        if (data["shortcuts-enabled"] === undefined) {
          chrome.storage.sync.set({ "shortcuts-enabled": true });
        }
        if (data["scrobbling-enabled"] === undefined) {
          chrome.storage.sync.set({ "scrobbling-enabled": true });
        }
        chrome.tabs.create({ url: chrome.extension.getURL("options.html") });
      }
    );
  }

  if (details.reason == "install" || details.reason == "update") {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (
          tab.url.search("http") >= 0 &&
          tab.url.search("chrome.google.com/webstore") == -1
        ) {
          chrome.tabs.executeScript(tab.id, { file: "scripts/loader.js" });
        }
      });
    });
  }
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.storage.sync.get("shortcuts-enabled", function (sync) {
    if (sync["shortcuts-enabled"] === true && interface_port != null) {
      interface_port.postMessage({ action: "send_command", type: command });
    }
  });
});
