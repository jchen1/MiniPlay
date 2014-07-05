$(function() {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-48472705-1']);
  _gaq.push(['_trackPageview']);

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
  }

  chrome.storage.local.get('id', function(data) {
    if (data['id'] && data['id'] !== -1) {
      chrome.tabs.sendMessage(data['id'], {action: 'update_status'}, update);
    }
    else {
      set_state('no_tab');
    }
  });

  var slider = new Dragdealer('slider', {
    callback: function(x, y) {
      chrome.storage.local.get('id', function(data) {
        chrome.tabs.sendMessage(data['id'],
        {
          'action': 'send_command',
          'type': 'slider',
          'position': x
        }, update);
      });
    },
    animationCallback: function(x, y) {
      chrome.storage.local.get('music_status', function(data) {
        var width = Math.round(x * ($('#slider').width() - ($('#slider-thumb').width())));
        $('#played-slider').attr('style', 'width:' + width + 'px;');
        var current_time_s = Math.round(x * data['music_status'].total_time_s);
        $('#current-time').html(secondsToHms(current_time_s));
      });
    },
    x: $('#played-slider').width() / ($('#slider').width() - ($('#slider-thumb').width())),
    speed: 1,
    slide: false
  });

  chrome.storage.sync.get('scrobbling-enabled', function(data) {
    update_scrobble(data['scrobbling-enabled']);
  });

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (changes['music_status'] && changes['music_status'].newValue) {
      update(changes['music_status'].newValue);
    }
    if (changes['scrobbling-enabled'] && changes['scrobbling-enabled'].newValue) {
      update_scrobble(changes['scrobbling-enabled'].newValue);
    }
  });

  function set_state(state) {
    switch (state) {
      case 'no_tab':
        $('.interface').attr('disabled', true);
        $('#infobar').hide();
        $('#album-art-img').attr('src', 'img/default_album.png');
        $('#title').html('No Google Music tab found');
        $('#artist').html('<a href="#">Click to open a new tab</a>');
        $('#artist a').on('click', function() {
          chrome.tabs.create({url: 'https://play.google.com/music'});
        });
        break;
      case 'no_song':
        $('.interface').attr('disabled', true);
        $('#infobar').hide();
        $('#album-art-img').attr('src', 'img/default_album.png');
        $('#title').html('No song selected');
        $('#artist').html('');
        $('#album').html('');
        break;
      case 'song':
        $('.interface').attr('disabled', false);
        $('#infobar').show();
        break;
    }
  }

  function update(response) {
    if (chrome.extension.lastError) {
      chrome.storage.local.set({'id' : -1});
      set_state('no_tab');
    }
    else {
      if (response.title === '') {
        set_state('no_song');
      }
      else {
        set_state('song');
        $('#title').html(response.title);
        $('#artist').html(response.artist);
        $('#album').html(response.album);
        if (response.album_art == 'http://undefined') {
          response.album_art = 'img/default_album.png';
        }
        $('#album-art-img').attr('src', response.album_art);
        toggle_play(response.status);
        if (!slider.dragging) {
          $('#current-time').html(response.current_time);
          $('#total-time').html(response.total_time);
          var width = Math.round((response.current_time_s / response.total_time_s) * ($('#slider').width() - ($('#slider-thumb').width())));
          $('#played-slider').attr('style', 'width:' + width + 'px;');
          $('#slider-thumb').attr('style', 'left:' + width + 'px;');
        }
        set_thumb(response.thumb);
        set_repeat(response.repeat);
        set_shuffle(response.shuffle);
      }
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

  function set_repeat(status) {
    if (status === 'SINGLE_REPEAT') {
      $('#repeat').addClass('control-single');
      $('#repeat').removeClass('control-list');
    }
    else if (status === 'LIST_REPEAT') {
      $('#repeat').addClass('control-list');
      $('#repeat').removeClass('control-single');
    }
    else if (status === 'NO_REPEAT') {
      $('#repeat').removeClass('control-single control-list');
    }
  }

  function set_shuffle(status) {
    if (status === 'NO_SHUFFLE') {
      $('#shuffle').removeClass('control-checked');
    }
    else if (status === 'ALL_SHUFFLE') {
      $('#shuffle').addClass('control-checked');
    }
  }

  function set_thumb(status) {
    if (status === '0') {
      $('.thumb').removeClass('control-checked');
    }
    else if (status === '5') {
      $('#down').removeClass('control-checked');
      $('#up').addClass('control-checked');
    }
    else if (status === '1') {
      $('#down').addClass('control-checked');
      $('#up').removeClass('control-checked');
    }
  }

  function toggle_play(status) {
    if (status === 'Pause') {
      $('#play').addClass('control-checked');
      $('#play').attr('title', 'Pause');
      $('#equalizer').addClass('equalizer-checked');
    }
    else if (status === 'Play') {
      $('#play').removeClass('control-checked');
      $('#play').attr('title', 'Play');
      $('#equalizer').removeClass('equalizer-checked');
    }
  }

  $('.control').on('click', function(e) {
    var name = $(e.currentTarget).attr('id');
    chrome.storage.local.get('id', function(data) {
      chrome.tabs.sendMessage(data['id'],
      {
        'action': 'send_command',
        'type': name
      }, update);
    });
  });
  $('#setting').on('click', function() {
    chrome.tabs.create({url: chrome.extension.getURL('options.html')});
  });
  $('#album-art-img').on('click', function() {
    chrome.storage.local.get('id', function (data) {
      if (data['id'] && data['id'] != -1) {
        chrome.tabs.update(data['id'], {selected: true});
        chrome.tabs.get(data['id'], function (tab) {
          chrome.windows.update(tab.windowId, {focused: true});
        });
      }
      else {
        chrome.tabs.create({url: 'https://play.google.com/music'});
      }
    });
  });
  $('#lastfm-toggle').on('click', function() {
    chrome.storage.sync.set({'scrobbling-enabled': $('#lastfm-toggle').hasClass('lastfm-checked')});
  });

  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
});
