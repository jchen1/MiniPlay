//changes the popup window
chrome.storage.local.get('id', update);

window.setInterval(function() {
  chrome.storage.local.get('id', update);
}, 1000);

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
}

function enable_buttons() {
  $('#play').prop('disabled', false);
  $('#rew').prop('disabled', false);
  $('#ff').prop('disabled', false);
  $('#down').prop('disabled', false);
  $('#up').prop('disabled', false);
  $('#shuffle').prop('disabled', false);
  $('#repeat').prop('disabled', false);  
}

function reset_titles() {
  $('#title').attr('title', '');
  $('#artist').attr('title', '');
  $('#album').attr('title', ''); 
}

function update(data) {
  if (data['id'] === undefined || data['id'] == '-1') {
    tab_not_found();
  }
  else {
    chrome.tabs.sendMessage(parseInt(data['id']), {action: 'get_status'},
    function(response) {
      if (chrome.extension.lastError) {
        chrome.storage.local.set({'id': '-1'});
        tab_not_found();
      }
      else {
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
      }
    });
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
  return (parseInt(time.split(':')[0]) * 60) + parseInt(time.split(':')[1]);
}

function set_slider(current, total) {
  var width = (get_time(current)/get_time(total)) * $('#popup').width();
  if (isNaN(width)) {
    width = 0;
  }
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
})