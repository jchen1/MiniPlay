$(() => {
  $('#extension').click(() => {
    chrome.tabs.create({ url: 'chrome://extensions/configureCommands' });
  });

  chrome.storage.sync.get(['shortcuts-enabled', 'notifications-enabled', 'scrobbling-enabled', 'lastfm_sessionID'], data => {
    if (data['notifications-enabled'] === true) {
      $('#enable-notifications').prop('checked', true);
    }
    if (data['shortcuts-enabled'] === true) {
      $('#enable-shortcuts').prop('checked', true);
    }
    if (data['scrobbling-enabled'] === true) {
      $('#enable-scrobbling').prop('checked', true);
      $('#login').show();
    } else {
      $('#login').hide();
    }
    if (data.lastfm_sessionID !== undefined && data['scrobbling-enabled'] === true) {
      $('#auth').show();
    } else {
      $('#auth').hide();
    }
  });

  $('#version').html(`MiniPlay v${chrome.app.getDetails().version} by <a href='https://github.com/iambald'>Jeff Chen</a>.`);

  $('#enable-shortcuts').click(() => {
    chrome.storage.sync.set(
      {
        'shortcuts-enabled': $('#enable-shortcuts').is(':checked')
      });
  });


  $('#enable-notifications').click(() => {
    chrome.storage.sync.set(
      {
        'notifications-enabled': $('#enable-notifications').is(':checked')
      });
  });

  $('#enable-scrobbling').click(() => {
    const a = $('#enable-scrobbling').is(':checked');
    chrome.storage.sync.set(
      {
        'scrobbling-enabled': a
      });
    if (a) {
      $('#login').show();
    } else {
      $('#login').hide();
      $('#auth').hide();
      chrome.storage.sync.remove(['lastfm_sessionID', 'lastfm_token']);
    }
  });

  $('#login a').click(() => {
    chrome.runtime.sendMessage({ type: 'auth' }, response => {});
  });

  $('.menu a').click(ev => {
    ev.preventDefault();
    const selected = 'selected';

    $('.mainview > *').removeClass(selected);
    $('.menu li').removeClass(selected);
    setTimeout(() => {
      $('.mainview > *:not(.selected)').css('display', 'none');
    }, 100);

    $(ev.currentTarget).parent().addClass(selected);
    const currentView = $($(ev.currentTarget).attr('href'));
    currentView.css('display', 'block');
    setTimeout(() => {
      currentView.addClass(selected);
    }, 0);

    setTimeout(() => {
      $('body')[0].scrollTop = 0;
    }, 200);
  });

  $('#launch_modal').click(ev => {
    ev.preventDefault();
    const modal = $('.overlay').clone();
    $(modal).removeAttr('style');
    $(modal).find('button, .close-button').click(() => {
      $(modal).addClass('transparent');
      setTimeout(() => {
        $(modal).remove();
      }, 1000);
    });

    $(modal).click(() => {
      $(modal).find('.page').addClass('pulse');
      $(modal).find('.page').on('webkitAnimationEnd', function() {
        $(this).removeClass('pulse');
      });
    });
    $(modal).find('.page').click(event => {
      event.stopPropagation();
    });
    $('body').append(modal);
  });

  $('.mainview > *:not(.selected)').css('display', 'none');
});
