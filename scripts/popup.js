//analytics

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-48472705-1']);
_gaq.push(['_trackPageview']);

//changes the popup window
chrome.storage.local.get('id', update);
chrome.storage.onChanged.addListener(function (changes, area) {
  if (changes['music_status'] && changes['music_status'].newValue) {
    update_response(changes['music_status'].newValue);
  }
});

function update_scrobble(value) {
  if (value) {
    $('#lastfm').removeClass('lastfm-checked');
    $('#lastfm').attr('title', 'Scrobbling enabled');
  }
  else {
    $('#lastfm').addClass('lastfm-checked');
    $('#lastfm').attr('title', 'Scrobbling disabled');
  }
}

function tab_not_found() {
  $('#title').html('No Google Music tab found');
  $('#artist').html('<a href="#">Click to open a new tab</a>');
  $('#artist a').css('outline', 'none');
  $('#artist a').css('text-decoration', 'none');
  $('#artist a').on('click', function() {
    chrome.tabs.create({url: "https://play.google.com/music"});
  });
  disable_buttons();
  reset_titles();
  $('#equalizer').hide();
  $('#setting').hide();
  $('#lastfm').hide();
}

function disable_buttons() {
  $('#play').prop('disabled', true);
  $('#rew').prop('disabled', true);
  $('#ff').prop('disabled', true);
  $('#down').prop('disabled', true);
  $('#up').prop('disabled', true);
  $('#shuffle').prop('disabled', true);
  $('#repeat').prop('disabled', true);
  $('#slider-thumb').hide();

  $('#title-fade').hide();
}

function enable_buttons() {
  $('#play').prop('disabled', false);
  $('#rew').prop('disabled', false);
  $('#ff').prop('disabled', false);
  $('#down').prop('disabled', false);
  $('#up').prop('disabled', false);
  $('#shuffle').prop('disabled', false);
  $('#repeat').prop('disabled', false);  

  $('#title-fade').show();
}

function reset_titles() {
  $('#title').attr('title', '');
  $('#artist').attr('title', '');
  $('#album').attr('title', ''); 
}

function update_response(response) {
  if (chrome.extension.lastError) {
    chrome.storage.local.set({'id': '-1'});
    tab_not_found();
  }
  else {
    $('#setting').show();
    if (response.title == '') {
      $('#title').html('No song selected');
      disable_buttons();
      reset_titles();
    }
    else {
      $('#title').html(response.title);
      $('#artist').html(response.artist);
      $('#album').html(response.album);

      $('#title').attr('title', response.title);
      $('#artist').attr('title', response.artist);
      $('#album').attr('title', response.album);
      enable_buttons();
    }

    if (response.album_art == 'http://undefined') {
      response.album_art = 'img/default_album.png';
    }
    $('#album-art-img').attr('src', response.album_art);
    $('#current-time').html(response.current_time);
    $('#total-time').html(response.total_time);
    toggle_play(response.status);
    set_slider(response.current_time, response.total_time);
    toggle_thumb(response.thumb);
    toggle_repeat(response.repeat);
    toggle_shuffle(response.shuffle);
    $('#equalizer').show();
    $('#lastfm').show();
    chrome.storage.sync.get('scrobbling-enabled', function (data) {
      if (data['scrobbling-enabled']) {
        $('#lastfm').removeClass('lastfm-checked');
        $('#lastfm').attr('title', 'Scrobbling enabled');
      }
      else {
        $('#lastfm').addClass('lastfm-checked');
        $('#lastfm').attr('title', 'Scrobbling disabled');
      }
    });
  }
}

function update(data) {
  if (data['id'] === undefined || data['id'] == '-1') {
    tab_not_found();
  }
  else {
    chrome.tabs.sendMessage(parseInt(data['id']), {action: 'get_status'}, update_response);
  }
}
function toggle_repeat(status) {
  if (status == 'single') {
    $("#repeat").addClass('control-single');
    $("#repeat").removeClass('control-list');
  }
  else if (status == 'list') {
    $("#repeat").addClass('control-list');
    $("#repeat").removeClass('control-single');
  }
  else if (status == 'none') {
    $("#repeat").removeClass('control-single');
    $("#repeat").removeClass('control-list');
  }
}

function toggle_shuffle(status) {
  if (status == 'off') {
    $("#shuffle").removeClass('control-checked');
  }
  if (status == 'on') {
    $("#shuffle").addClass('control-checked');
  }
}

function toggle_thumb(status) {
  if (status == 'None') {
    $('#down').removeClass('control-checked');
    $('#up').removeClass('control-checked');
  }
  else if (status == 'Up') {
    $('#down').removeClass('control-checked');
    $('#up').addClass('control-checked');
  }
  else if (status == 'Down') {
    $('#down').addClass('control-checked');
    $('#up').removeClass('control-checked');
  }
}

function toggle_play(status) {
  if (status == 'playing') {
    $('#play').addClass('control-checked');
    $('#play').attr('title', 'Pause');
    $('#equalizer').addClass('equalizer-checked');
  }
  else if (status == 'paused') {
    $('#play').removeClass('control-checked');
    $('#play').attr('title', 'Play');
    $('#equalizer').removeClass('equalizer-checked');
  }
}

function get_time(time) {
  var time = (parseInt(time.split(':')[0]) * 60) + parseInt(time.split(':')[1]);
  return (isNaN(time) ? 0 : time);
}

function set_slider(current, total) {
  var width = (get_time(current)/get_time(total)) * $('#popup').width();
  $('#played-slider').attr('style', 'width:' + width + 'px;');
  $('#slider-thumb').attr('style', 'left:' + width + 'px;');
  if ($('#play').hasClass('control-checked') || Math.round(width) != 0) {
    $('#slider-thumb').show();
  }
  else {
    $('#slider-thumb').hide();
  }
}

function update_act(type) {
  if (type == 'play' && $('#play').attr('title') == 'Play') {
    toggle_play('playing');
  }
  else if (type == 'play') {
    toggle_play('paused');
  }

  if (type == 'up' && $('#up').hasClass('control-checked')) {
    $('#up').removeClass('up');
  }
  else if (type == 'up') {
    $('#up').addClass('control-checked');
    $('#down').removeClass("control-checked");
  }

  if (type == 'down' && $('#down').hasClass('control-checked')) {
    $('#down').removeClass('control-checked');
  }
  else if (type == 'down') {
    $('#down').addClass('control-checked');
    $('#up').removeClass('control-checked');
  }

  if (type == 'repeat') {
    if ($("#repeat").hasClass('control-list')) {
      toggle_repeat('single');
    }
    else if ($("#repeat").hasClass('control-single')) {
      toggle_repeat('none');
    }
    else {
      toggle_repeat('list');
    }
  }

  if (type == 'shuffle') {
    if ($("#shuffle").hasClass('control-checked')) {
      toggle_shuffle('off');
    }
    else {
      toggle_shuffle('on');
    }
  }
}

function act(selector) {
  if (!$(selector).is(':disabled')) {
    chrome.storage.local.get('id', function(data) {
      chrome.tabs.sendMessage(parseInt(data['id']),
      {
        'action': 'send_command',
        'type': selector.substring(1)
      }, function() { update_act(selector.substring(1)); });
    });
  }
}

$(function() {
  $('#play').on('click', function() {
    act('#play');
  });
  $('#rew').on('click', function() {
    act('#rew');
  });
  $('#ff').on('click', function() {
    act('#ff');
  });
  $('#up').on('click', function() {
    act('#up');
  });
  $('#down').on('click', function() {
    act('#down');
  });
  $('#shuffle').on('click', function() {
    act('#shuffle');
  });
  $('#repeat').on('click', function() {
    act('#repeat');
  });
  $('#setting').on('click', function() {
    chrome.tabs.create({url: chrome.extension.getURL('options.html')});
  });
  $('#album-art-img').on('click', function() {
    chrome.storage.local.get('id', function (data) {
      if (data['id'] && data['id'] != '-1') {
        chrome.tabs.update(parseInt(data['id']), {selected: true});
        chrome.tabs.get(parseInt(data['id']), function (tab) {
          chrome.windows.update(tab.windowId, {focused: true});
        });
      }
      else {
        chrome.tabs.create({url: "https://play.google.com/music"});
      }
    });
  });
  $('#lastfm').on('click', function() {
    if ($('#lastfm').hasClass('lastfm-checked')) {  //disabled, should enable
      chrome.storage.sync.set({'scrobbling-enabled': true});
      update_scrobble(true);
    }
    else {
      chrome.storage.sync.set({'scrobbling-enabled': false});
      update_scrobble(false);
    }
  });
});

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();