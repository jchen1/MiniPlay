$(function() {
  var background_port = chrome.runtime.connect({name: "popup"});
  var interface_port = null;
  var music_status = null;

  background_port.onMessage.addListener(function(msg) {
    if (msg.type == 'connect') {
      interface_port = chrome.tabs.connect(msg.id, {name: "popup"});
      interface_port.id = msg.id;
      interface_port.onDisconnect.addListener(function() {
        interface_port = null;
        set_state("no_tab");
      });
      interface_port.onMessage.addListener(update);
    }
  });

  set_state("no_tab");

  function setupAnalytics() {
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-48472705-1']);
    _gaq.push(['_trackPageview']);

    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  }

  function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
  }

  var slider = new Dragdealer('slider', {
    callback: function(x, y) {
      if (interface_port) {
        interface_port.postMessage(
        {
          'action': 'send_command',
          'type': 'slider',
          'position': x
        });
      }
    },
    animationCallback: function(x, y) {
      if (music_status) {
        $('#played-slider').css('width', $('#slider-thumb').css('left'));
        $('#current-time').html(secondsToHms(Math.round(x * music_status.total_time_s)));
      }
    },
    x: $('#played-slider').width() / ($('#slider').width() - ($('#slider-thumb').width())),
    speed: 1,
    slide: false,
    right: parseInt($('#slider-thumb').css('height'), 10)
  });

  var vslider = new Dragdealer('vslider', {
    callback: function(x, y) {
      if (interface_port) {
        interface_port.postMessage(
        {
          'action': 'send_command',
          'type': 'vslider',
          'position': 1 - y
        });
      }
    },
    animationCallback: function(x, y) {
      var height = parseInt($('#vslider-thumb').css('top'), 10);
      $('#played-vslider').css('height', height);
    },
    horizontal: false,
    vertical: true,
    y: $('#played-vslider').height() / ($('#vslider-background').height() - $('#vslider-thumb').height()),
    speed: 1,
    slide: false,
    top: parseInt($('#vslider-thumb').css('height'), 10)
  });

  chrome.storage.sync.get('scrobbling-enabled', function(data) {
    update_scrobble(data['scrobbling-enabled']);
  });

  function set_album_art(url) {
    var background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url(' + url + ')';
    $('#album-art').css('background', background);
    $('#album-art').css('background-size', '320px 320px');
  }

  function set_state(state) {
    switch (state) {
      case 'no_tab':
        $('.interface').attr('disabled', true);
        $('#infobar').hide();
        set_album_art('img/default_album.png');
        $('#title').html('No Google Music tab found');
        $('#artist').html('<a href="#">Click to open a new tab</a>');
        $('#artist a').on('click', function() {
          chrome.tabs.create({url: 'https://play.google.com/music'});
        });
        break;
      case 'no_song':
        $('.interface').attr('disabled', true);
        $('#infobar').hide();
        set_album_art('img/default_album.png');
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
      set_state('no_tab');
    }
    else {
      music_status = response;
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
        set_album_art(response.album_art);
        toggle_play(response.status);
        if (!slider.dragging) {
          $('#current-time').html(response.current_time);
          $('#total-time').html(response.total_time);
          var offset = Math.round((response.current_time_s / response.total_time_s) * ($('#slider').width() - ($('#slider-thumb').width())));
          $('#played-slider').attr('style', 'width:' + offset + 'px;');
          $('#slider-thumb').attr('style', 'left:' + offset + 'px;');
        }
        set_thumb(response.thumb);
        set_repeat(response.repeat);
        set_shuffle(response.shuffle);
        disable_buttons(response.disabled_buttons);
      }
    }
  }

  function disable_buttons(disabled) {
    for (var i = 0; i < disabled.length; i++) {
      switch (disabled[i]) {
        case 'play': $('#play').attr('disabled', true); break;
        case 'rew': $('#rew').attr('disabled', true); break;
        case 'ff': $('#ff').attr('disabled', true); break;
        case 'up': $('#up').attr('disabled', true); break;
        case 'down': $('#down').attr('disabled', true); break;
        case 'shuffle': $('#shuffle').css('display', 'none'); break;
        case 'repeat': $('#repeat').css('display', 'none'); break;
        case 'slider': $('#slider').attr('disabled', true); if (!slider.disabled) slider.disable(); break;
        case 'vslider': $('#volume').css('display', 'none'); break;
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

  $('.control, .top-control').on('click', function(e) {
    var name = $(e.currentTarget).attr('id');
    if (interface_port) {
      interface_port.postMessage(
      {
        'action': 'send_command',
        'type': name
      });
    }
  });

  $('#volume').click(function(ev) {
    if ($('#volume').prop('disabled') == false) {
      $('#vslider').css('top', $('#top-bar').height());
      if ($('#vslider').css('visibility') == 'hidden') {
        $('#vslider').css('visibility', 'visible');
        $('#volume').addClass('control-checked');
      }
      else {
        $('#vslider').css('visibility', 'hidden');
        $('#volume').removeClass('control-checked');
      }
      ev.stopPropagation();
    }
  });

  $('body').click(function(ev) {
    if (ev.target.id != 'vslider' && $('#vslider').has(ev.target).length === 0) {
      $('#vslider').css('visibility', 'hidden');
      $('#volume').removeClass('control-checked');
    }
  });
  $('#options').on('click', function() {
    chrome.tabs.create({url: chrome.extension.getURL('options.html')});
  });
  $('#album-art-img').on('click', function() {
    if (interface_port) {
      chrome.tabs.update(interface_port.id, {highlighted: true});
      chrome.tabs.get(interface_port.id, function (tab) {
        chrome.windows.update(tab.windowId, {focused: true});
      });
    }
  });
  $('#lastfm-toggle').on('click', function() {
    update_scrobble($('#lastfm-toggle').hasClass('lastfm-checked'));
    chrome.storage.sync.set({'scrobbling-enabled': $('#lastfm-toggle').hasClass('lastfm-checked')});
  });

  setupAnalytics();
});
