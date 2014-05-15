//analytics

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-48472705-1']);
_gaq.push(['_trackPageview']);

chrome.storage.local.get('id', function(data) {
  if (data['id'] && data['id'] !== -1) {
    chrome.tabs.sendMessage(parseInt(data['id']), {action: 'get_status'}, update);
  }
  else {
    tab_not_found();
  }
});

chrome.storage.sync.get('scrobbling-enabled', function(data) {
  update_scrobble(data['scrobbling-enabled']);
});

chrome.storage.onChanged.addListener(function (changes, area) {
  if (changes['music_status'] && changes['music_status'].newValue) {
    update(changes['music_status'].newValue);
  }
  if (changes['scrobbling-enabled'] && changes['scrobbling-enabled'].newValue !== undefined) {
    update_scrobble(changes['scrobbling-enabled'].newValue);
  }
});

function update(response) {
  if (chrome.extension.lastError) {
    chrome.storage.local.set({'id' : -1});
    tab_not_found();
  }
  else {
    if (response.title === '') {
      disable_buttons();
      $('#title').html('No song selected');
    }
    else {
      enable_buttons();
      $('#title').html(response.title);
      $('#artist').html(response.artist);
      $('#album').html(response.album);

      if (response.album_art == 'http://undefined') {
        response.album_art = 'img/default_album.png';
      }
      $('#album-art-img').attr('src', response.album_art);
      $('#current-time').html(response.current_time);
      $('#total-time').html(response.total_time);
      toggle_play(response.status);
      set_slider(response.current_time, response.total_time);
    }

    toggle_thumb(response.thumb);
    toggle_repeat(response.repeat);
    toggle_shuffle(response.shuffle);
    $('#equalizer').show();
    $('#lastfm-toggle').show();
    $('#time').show();
  }
}

function update_scrobble(value) {
  if (value === true) {
    $('#lastfm-toggle').removeClass('lastfm-checked');
    $('#lastfm-toggle').attr('title', 'Scrobbling enabled');
  }
  else {
    $('#lastfm-toggle').addClass('lastfm-checked');
    $('#lastfm-toggle').attr('title', 'Scrobbling disabled');
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
  $('#equalizer').hide();
  $('#lastfm-toggle').hide();
  $('#time').hide();
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

function toggle_repeat(status) {
  if (status == 'SINGLE_REPEAT') {
    $("#repeat").addClass('control-single');
    $("#repeat").removeClass('control-list');
  }
  else if (status == 'LIST_REPEAT') {
    $("#repeat").addClass('control-list');
    $("#repeat").removeClass('control-single');
  }
  else if (status == 'NO_REPEAT') {
    $("#repeat").removeClass('control-single');
    $("#repeat").removeClass('control-list');
  }
}

function toggle_shuffle(status) {
  if (status === 'NO_SHUFFLE') {
    $("#shuffle").removeClass('control-checked');
  }
  else if (status === 'ALL_SHUFFLE') {
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
      toggle_repeat('SINGLE_REPEAT');
    }
    else if ($("#repeat").hasClass('control-single')) {
      toggle_repeat('NO_REPEAT');
    }
    else {
      toggle_repeat('LIST_REPEAT');
    }
  }

  if (type == 'shuffle') {
    if ($("#shuffle").hasClass('control-checked')) {
      toggle_shuffle('NO_SHUFFLE');
    }
    else {
      toggle_shuffle('ALL_SHUFFLE');
    }
  }
}

$(function() {
  $('.interface').on('click', function(e) {
    var name = $(e.currentTarget).attr('id');
    chrome.storage.local.get('id', function(data) {
      chrome.tabs.sendMessage(parseInt(data['id']),
      {
        'action': 'send_command',
        'type': name
      }, function() { update_act(name); });
    });
  });
  $('#setting').on('click', function() {
    chrome.tabs.create({url: chrome.extension.getURL('options.html')});
  });
  $('#album-art-img').on('click', function() {
    chrome.storage.local.get('id', function (data) {
      if (data['id'] && data['id'] != -1) {
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
  $('#lastfm-toggle').on('click', function() {
    chrome.storage.sync.set({'scrobbling-enabled': $('#lastfm-toggle').hasClass('lastfm-checked')});
  });
});

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
