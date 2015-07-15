$(function() {
  var background_port = chrome.runtime.connect({name: "popup"});
  var interface_port = null;
  var music_status = null;
  var dragging = false;

  background_port.onMessage.addListener(function(msg) {
    if (msg.type == 'connect') {
      interface_port = chrome.tabs.connect(msg.id, {name: "popup"});
      interface_port.id = msg.id;
      interface_port.onDisconnect.addListener(function() {
        interface_port = null;
        set_state("no_tab");
      });
      interface_port.onMessage.addListener(update);
      set_state("no_song");
    }
    set_state("no_song");
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

  function set_album_art(url) {
    var background = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url(' + url + ')';
    $('#album-art').css('background', background);
    $('#album-art').css('background-size', '320px 320px');
  }

  function set_state(state) {
    switch (state) {
      case 'no_tab':
        $('.interface').attr('disabled', true);
        set_album_art('img/default_album.png');
        $('#title').html('No music tab found');
        $('#artist').html('');
        $('#current-time, #total-time').css('display', 'none');
        break;
      case 'no_song':
        $('.interface').attr('disabled', true);
        set_album_art('img/default_album.png');
        $('#title').html('No song selected');
        $('#artist').html('');
        $('#album').html('');
        $('#current-time, #total-time').css('display', 'none');
        break;
      case 'song':
        $('.interface').attr('disabled', false);
        $('#current-time, #total-time').css('display', 'block');
        break;
    }
  }

  function update(response) {
    if (chrome.extension.lastError) {
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
        set_album_art(response.album_art);
        toggle_play(response.status);
        if (!dragging) {
          $('#slider').attr('max', response.total_time_s);
          var offset = response.current_time_s / response.total_time_s;
          $('#slider-wrapper').find('.mdl-slider__background-lower').attr('style', 'flex: ' + offset + ' 1 0%;');
          $('#slider-wrapper').find('.mdl-slider__background-upper').attr('style', 'flex: ' + (1 - offset) + ' 1 0%;');
          $('#slider').val(response.current_time_s);
          if (response.current_time_s > 0) {
            $('#slider').removeClass('is-lowest-value');
          }
          else {
            $('#slider').addClass('is-lowest-value');
          }
          $('#current-time').html(response.current_time);
          $('#total-time').html(response.total_time);
        }
        $('#vol-slider').val(response.volume * 100);
        $('#vol-wrapper').find('.mdl-slider__background-lower').attr('style', 'flex: ' + response.volume + ' 1 0%;');
        $('#vol-wrapper').find('.mdl-slider__background-upper').attr('style', 'flex: ' + (1 - response.volume) + ' 1 0%;');
        if ($('#vol-slider').val() > 0) {
          $('#slider').removeClass('is-lowest-value');
        }
        set_thumb(response.thumb);
        set_repeat(response.repeat);
        set_shuffle(response.shuffle);
        disable_buttons(response.disabled_buttons);
        set_playlist(response.playlist);
        set_volume(response.volume);
      }
      music_status = response;
    }
  }

  function set_playlist(playlist) {
    for (var i = 0; i < playlist.length; i++) {
      var item = playlist[i];
      if ((music_status && music_status.playlist && i < music_status.playlist.length && item.title == music_status.playlist[i].title) ||
          (item.title == '')) {
        continue;
      }
      var details =
        $('<td>').addClass('song-details-span').addClass('mdl-data-table__cell--non-numeric').append(
          $('<span>').addClass('song-info').append(
            $('<img>').attr('src', item.album_art).addClass('small-art')).append(
            $('<div>').addClass('song-details').append(
              $('<div>').addClass('song-title').text(item.title)).append(
              $('<div>').addClass('song-artist-album').text(item.artist + " - " + item.album)
            )
          )
        );
      var duration =
        $('<td>').addClass('duration').append(
          $('<span>').text(item.total_time)
        );
      var playcount =
        $('<td>').addClass('play-count').append(
          $('<span>').text(item.play_count)
        );

      if ($('#playlist-table > tbody > tr').length <= i) {
        $('#playlist-table > tbody').append($('<tr>').addClass('song-row').append(details).append(duration).append(playcount).click(function() {
          if (interface_port) {
            interface_port.postMessage(
            {
              'action': 'send_command',
              'type': 'playlist',
              'index': $(this).closest('tr').index()
            });
          }
        }));
      }
      else {
        $('#playlist-table > tbody > tr').eq(i).empty();
        $('#playlist-table > tbody > tr').eq(i).append(details).append(duration).append(playcount);
      }
    }

    $('#playlist-table > tbody > tr:gt(' + (playlist.length - 1) + ')').remove();
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
        case 'slider': $('#slider').attr('disabled', true); break;
        case 'vslider': $('#vol').css('display', 'none'); break;
        case 'playlist': $('#playlist-button').css('display', 'none'); break;
      }
    }
  }

  function set_repeat(status) {
    if (status === 'SINGLE_REPEAT') {
      $('#repeat').addClass('top-control-active');
      $('#repeat > i').text('repeat_one');
    }
    else if (status === 'LIST_REPEAT') {
      $('#repeat').addClass('top-control-active');
      $('#repeat > i').text('repeat');
    }
    else if (status === 'NO_REPEAT') {
      $('#repeat').removeClass('top-control-active');
      $('#repeat > i').text('repeat');
    }
  }

  function set_shuffle(status) {
    if (status === 'NO_SHUFFLE') {
      $('#shuffle').removeClass('top-control-active');
    }
    else if (status === 'ALL_SHUFFLE') {
      $('#shuffle').addClass('top-control-active');
    }
  }

  function set_thumb(status) {
    if (status === '0') {
      $('.thumb').removeClass('mdl-button--colored');
    }
    else if (status === '5') {
      $('#down').removeClass('mdl-button--colored');
      $('#up').addClass('mdl-button--colored');
    }
    else if (status === '1') {
      $('#down').addClass('mdl-button--colored');
      $('#up').removeClass('mdl-button--colored');
    }
  }

  function toggle_play(status) {
    if (status === 'Pause') {
      $('#play > i').text('pause');
      $('#play').attr('title', 'Pause');
    }
    else if (status === 'Play') {
      $('#play > i').text('play_arrow');
      $('#play').attr('title', 'Play');
    }
  }

  function set_volume(vol) {
    if ($('#vol-slider').prop('disabled') == false) {
      if (vol == 0) {
        $('#vol > i').text('volume_mute');
      }
      else if (vol < 50) {
        $('#vol > i').text('volume_down');
      }
      else {
        $('#vol > i').text('volume_up');
      }
    }
  }

  $('.control, .top-control').on('click', function(e) {
    if (interface_port) {
      interface_port.postMessage(
      {
        'action': 'send_command',
        'type': $(e.currentTarget).attr('id')
      });
    }
    e.stopPropagation();
  });

  $('#vol, #vol-up').click(function(ev) {
    if ($('#vol-slider').prop('disabled') == false) {
      $('#vol-slider').prop('disabled', true);
      $('#vol-wrapper').css('display', 'none');
      set_volume($('#vol-slider').val());
      $('#vol-up').css('display', 'none');
      $('.thumb').css('display', 'block');
      if (!music_status || music_status.disabled_buttons.indexOf('playlist') < 0) {
        $('#playlist-button').css('display', 'block');
      }
    }
    else {
      $('#vol-slider').prop('disabled', false);
      $('#vol-wrapper').css('display', 'block');
      $('#vol > i').text('volume_down');
      $('#vol-up').css('display', 'block');
      $('.thumb').css('display', 'none');
      $('#playlist-button').css('display', 'none');
    }
  });

  $('#vol-slider').on('input', function() {
    if (interface_port) {
      interface_port.postMessage(
      {
        'action': 'send_command',
        'type': 'vslider',
        'position': $('#vol-slider').val() / $('#vol-slider').attr('max')
      });
    }
  });

  $('#playlist-button').click(function() {
    if ($('#playlist').css('display') == 'none') {
      $('#playlist').css('display', 'flex');
    }
    else {
      $('#playlist').css('display', 'none');
    }
  });

  // TODO: slider is broken when tab is not in focus
  $('#slider').on('mouseup', function() {
    dragging = false;

    if (interface_port) {
      interface_port.postMessage(
      {
        'action': 'send_command',
        'type': 'slider',
        'position': $('#slider').val() / $('#slider').attr('max')
      });
    }
  }).on('mousedown', function() {
    dragging = true;
  }).on('input', function() {
    $('#current-time').html(secondsToHms($('#slider').val()));
  });

  $('#settings').click(function() {
    chrome.tabs.create({url: chrome.extension.getURL('options.html')});
  });

  $('#album-art').on('click', function() {
    if (interface_port) {
      chrome.tabs.update(interface_port.id, {highlighted: true});
      chrome.tabs.get(interface_port.id, function (tab) {
        chrome.windows.update(tab.windowId, {focused: true});
      });
    }
  });

  setupAnalytics();
});
