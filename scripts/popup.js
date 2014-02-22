//changes the popup window

window.setInterval(function() {
  chrome.storage.local.get('id', update);
}, 1000);

chrome.storage.local.get('id', update);

function tab_not_found() {
  $('#title').html('No Google Music tab found');
  $('#artist').html('<a href="#">Click to open a new tab</a>');
  $('#artist a').css('outline', 'none');
  $('#artist a').on('click', function() {
    chrome.tabs.create({url: "https://play.google.com/music"});
  });
  disable_buttons();
}

function disable_buttons() {
  $('#play').prop('disabled', true);
  $('#rew').prop('disabled', true);
  $('#ff').prop('disabled', true);
  $('#down').prop('disabled', true);
  $('#up').prop('disabled', true);
  $('#shuffle').prop('disabled', true);
  $('#repeat').prop('disabled', true);
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

function update(data) {
  if (data['id'] === undefined || data['id'] == '-1') {
    tab_not_found();
  }
  else {
    chrome.tabs.sendMessage(parseInt(data['id']), {action: 'update_status'},
      function(response) {
        if (chrome.extension.lastError) {
          chrome.storage.local.set('id', '-1');
          tab_not_found();
        }
        else {
          if (response.title == '') {
            $('#title').html('No song selected');
            disable_buttons();
          }
          else {
            $('#title').html(response.title);
            $('#artist').html(response.artist);
            $('#album').html(response.album); 
            enable_buttons();           
          }

          if (response.album_art == 'http://undefined') {
            response.album_art = 'http://play.google.com/music/default_album_med.png';
          }
          $('#album-art-img').attr('src', response.album_art);
          $('#current-time').html(response.current_time);
          $('#total-time').html(response.total_time);

          set_slider(response.current_time, response.total_time, response.status);
          toggle_play(response.status);
          toggle_thumb(response.thumb);
          toggle_repeat(response.repeat);
          toggle_shuffle(response.shuffle); 
        }
      });
  }
}
function toggle_repeat(status) {
  //console.log(status);
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
    $("#play").attr('title', 'Pause');
  }
  else if (status == 'paused') {
    $('#play').removeClass('control-checked');
    $("#play").attr('title', 'Play');
  }
}

function set_slider(current, total, status) {
  var total_width = 450;
  var total_secs = (parseInt(total.split(':')[0]) * 60) +
                    parseInt(total.split(':')[1]);
  var current_secs = (parseInt(current.split(':')[0]) * 60) +
                      parseInt(current.split(':')[1]);
  var width = Math.round((current_secs/total_secs) * total_width);
  $('#played-slider').attr('style', 'width:' + width + 'px;');
  $('#slider-thumb').attr('style', 'left:' + width + 'px;');
  if (status == 'playing') {
    $('#slider-thumb').show();
  }
  else {
    $('#slider-thumb').hide();
  }
}

function act(storage, type) {
  chrome.tabs.sendMessage(parseInt(storage['id']),
    {
      'action': 'send_command',
      'type': type
    }, function() { update_act(type); });
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
    if ($('#down').hasClass("control-checked")) {
      $('#down').removeClass("control-checked");
    }
  }

  if (type == 'down' && $('#down').hasClass('control-checked')) {
    $('#down').removeClass('control-checked');
  }
  else if (type == 'control') {
    $('#down').addClass('control-checked');
    if ($('#up').hasClass('control-checked')) {
      $('#up').removeClass('control-checked');
    }
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

$(function() {
  $('#play').on('click', function() {
    if (!$('#play').is(':disabled')) {
      chrome.storage.local.get('id', function(data) { act(data, 'play'); });
    }
  });
  $('#rew').on('click', function() {
    if (!$('#rew').is(':disabled')) {
      chrome.storage.local.get('id', function(data) { act(data, 'rew'); });
    }
  });
  $('#ff').on('click', function() {
    if (!$('#ff').is(':disabled')) {
      chrome.storage.local.get('id', function(data) { act(data, 'ff'); });
    }
  });
  $('#up').on('click', function() {
    if (!$('#up').is(':disabled')) {
      chrome.storage.local.get('id', function(data) { act(data, 'up'); });
    }
  });
  $('#down').on('click', function() {
    if (!$('#down').is(':disabled')) {
      chrome.storage.local.get('id', function(data) { act(data, 'down'); });
    }
  });
  $('#shuffle').on('click', function() {
    if (!$('#shuffle').is(':disabled')) {
      chrome.storage.local.get('id', function(data) { act(data, 'shuffle'); });
    }
  });
  $('#repeat').on('click', function() {
    if (!$('#repeat').is(':disabled')) {
      chrome.storage.local.get('id', function(data) { act(data, 'repeat'); });
    }
  });
})