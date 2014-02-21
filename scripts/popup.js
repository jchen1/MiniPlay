//changes the popup window

window.setInterval(function() {
  chrome.storage.local.get('id', update);
}, 1000);

function update(data) {
  if (data['id'] === undefined || data['id'] == '-1') {
    console.log('uh oh');
  }
  else {
    chrome.tabs.sendMessage(parseInt(data['id']), {action: 'update_status'},
      function(response) {
        if (chrome.extension.lastError) {

        }
        else {
          console.log(response.title);
        }
      });
  }
}