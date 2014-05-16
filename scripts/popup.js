$(function() {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-48472705-1']);
  _gaq.push(['_trackPageview']);

  function sendSliderPct(pct) {
    chrome.storage.local.get('id', function(data) {
      chrome.tabs.sendMessage(parseInt(data['id']),
      {
        'action': 'update_slider',
        'position': pct
      }, update);
    });
  }

  $('#slider').on('click', function (e) {
    $('#played-slider').attr('style', 'width:' + (e.offsetX - 6) + 'px;');
    slider.setValue((e.offsetX-6) / $('#slider').width(), 0, true);
  });

  var slider = new Dragdealer('slider', {
    callback: function(x, y) {
      sendSliderPct(100 * x);
    },
    animationCallback: function(x, y) {
      var width = Math.round(x * $('#popup').width());
      $('#played-slider').attr('style', 'width:' + width + 'px;');
    },
    x: $('#played-slider').width() / $('#popup').width()
  });

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
        $('.interface').prop('disabled', true);
        $('#slider-thumb').hide();
        $('#title').html('No song selected');
        $('#slider').attr('style', '');
      }
      else {
        $('.interface').prop('disabled', false);
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
        if (!slider.dragging) {
          set_slider(get_time(response.current_time), get_time(response.total_time));
        }
        $('#slider').attr('style', 'cursor: pointer;');
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
    $('#artist a').on('click', function() {
      chrome.tabs.create({url: "https://play.google.com/music"});
    });
    $('.interface').prop('disabled', true);
    $('#slider-thumb').hide();
    $('#equalizer').hide();
    $('#lastfm-toggle').hide();
    $('#time').hide();
    $('#slider').attr('style', '');
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
    if (status === 'playing') {
      $('#play').addClass('control-checked');
      $('#play').attr('title', 'Pause');
      $('#equalizer').addClass('equalizer-checked');
    }
    else if (status === 'paused') {
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
    var width = Math.round((current / total) * $('#popup').width());
    $('#played-slider').attr('style', 'width:' + width + 'px;');
    $('#slider-thumb').attr('style', 'left:' + width + 'px;');
  }

  $('.interface').on('click', function(e) {
    var name = $(e.currentTarget).attr('id');
    chrome.storage.local.get('id', function(data) {
      chrome.tabs.sendMessage(parseInt(data['id']),
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

  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
});
