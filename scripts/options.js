$(function() {
  $('#extension').click(function() {
    chrome.tabs.create({url: "chrome://chrome/extensions"});
  });

  chrome.storage.sync.get(['shortcuts-enabled', 'notifications-enabled'],
    function (data) {
      if (data['notifications-enabled'] == 'true') {
        $('#enable-notifications').prop('checked', true);
      }
      if (data['shortcuts-enabled'] == 'true') {
        $('#enable-shortcuts').prop('checked', true);
      }
    });

  $('#enable-shortcuts').click(function() {
    if ($('#enable-shortcuts').is(':checked')) {
      chrome.storage.sync.set({'shortcuts-enabled' : 'true'});
    }
    else {
      chrome.storage.sync.set({'shortcuts-enabled' : 'false'});
    }
  });


  $('#enable-notifications').click(function() {
    if ($('#enable-notifications').is(':checked')) {
      chrome.storage.sync.set({'notifications-enabled' : 'true'});
      console.log('hi');
    }
    else {
      chrome.storage.sync.set({'notifications-enabled' : 'false'});
      console.log('bye');
    }
  });

  $('.menu a').click(function(ev) {
    ev.preventDefault();
    var selected = 'selected';

    $('.mainview > *').removeClass(selected);
    $('.menu li').removeClass(selected);
    setTimeout(function() {
      $('.mainview > *:not(.selected)').css('display', 'none');
    }, 100);

    $(ev.currentTarget).parent().addClass(selected);
    var currentView = $($(ev.currentTarget).attr('href'));
    currentView.css('display', 'block');
    setTimeout(function() {
      currentView.addClass(selected);
    }, 0);

    setTimeout(function() {
      $('body')[0].scrollTop = 0;
    }, 200);
  });

  $('#launch_modal').click(function(ev) {
    ev.preventDefault();
    var modal = $('.overlay').clone();
    $(modal).removeAttr('style');
    $(modal).find('button, .close-button').click(function() {
      $(modal).addClass('transparent');
      setTimeout(function() {
        $(modal).remove();
      }, 1000);
    });

    $(modal).click(function() {
      $(modal).find('.page').addClass('pulse');
      $(modal).find('.page').on('webkitAnimationEnd', function() {
        $(this).removeClass('pulse');
      });
    });
    $(modal).find('.page').click(function(ev) {
      ev.stopPropagation();
    });
    $('body').append(modal);
  });

  $('.mainview > *:not(.selected)').css('display', 'none');
});