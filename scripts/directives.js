popupApp.directive('mdlSlider', function() {
  return {
    restrict: 'C',
    link: function (scope, element, attrs) {
      scope.$watch(function() {
        return attrs.value;
      }, function() {
        for (var i = 0; i < element.length; i++) {
          if (element[i].MaterialSlider) {
            if (element[i].getAttribute('id') == 'slider') {
              element[i].MaterialSlider.change(element[i].getAttribute('value'));
            }
            else {
              element[i].MaterialSlider.change();
            }
          }
        }
        $(element).hide().show(0);
      });
    }
  }
});

popupApp.directive('mpSlider', function() {
  var secondsToHms = function(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
  };

  return {
    restrict: 'C',
    link: function (scope, element, attrs) {
      // TODO: slider is broken when tab is not in focus
      $(element).on('mouseup', function() {
        dragging = false;

        if (scope.interface_port) {
          scope.interface_port.postMessage(
          {
            'action': 'send_command',
            'type': 'slider',
            'position': $(element).val() / $(element).attr('max')
          });
        }
      }).on('mousedown', function() {
        dragging = true;
      }).on('input', function() {
        $('#current-time').html(secondsToHms($(element).val()));
      });
    }
  }
});

popupApp.directive('mpVolslider', function() {
  return {
    restrict: 'C',
    link: function (scope, element, attrs) {
      $(element).on('input', function(event) {
        if (scope.interface_port) {
          scope.interface_port.postMessage(
          {
            'action': 'send_command',
            'type': 'vslider',
            'position': $(element).val() / $(element).attr('max')
          });
        }
      });
    }
  }
});

popupApp.directive('mpScrollIf', function() {
  var getScrollingParent = function(element) {
    element = element.parentElement;
    while (element) {
      if (element.scrollHeight !== element.clientHeight) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  };
  
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(function() {
        return scope.$eval(attrs.mpScrollIf);
      }, function(value) {
        if (value) {
          var sp = getScrollingParent(element[0]);
          var topMargin = parseInt(attrs.scrollMarginTop) || 0;
          var bottomMargin = parseInt(attrs.scrollMarginBottom) || 0;
          var elemOffset = element[0].offsetTop;
          var elemHeight = element[0].clientHeight;

          if (sp) {
            if (elemOffset - topMargin < sp.scrollTop) {
                sp.scrollTop = elemOffset - topMargin;
            } else if (elemOffset + elemHeight + bottomMargin > sp.scrollTop + sp.clientHeight) {
                sp.scrollTop = elemOffset + elemHeight + bottomMargin - sp.clientHeight;
            }
          }
        }
      });
    }
  }
});

popupApp.directive('mpControl', function() {
  return {
    restrict: 'A',
    link: function (scope, elements, attrs) {
      $(elements).on('click', function(event) {
        if (scope.interface_port) {
          scope.interface_port.postMessage(
          {
            'action': 'send_command',
            'type': event.currentTarget.getAttribute('id')
          });
          event.stopPropagation();
        }
      });
    }
  }
});

popupApp.directive('albumArt', function() {
  return {
    restrict: 'C',
    link: function (scope, elements, attrs) {
      $(elements).on('click', function(event) {
        if (scope.interface_port) {
          chrome.tabs.update(scope.interface_port.id, {highlighted: true});
          chrome.tabs.get(scope.interface_port.id, function (tab) {
            chrome.windows.update(tab.windowId, {focused: true});
          });
        }
      });
    }
  }
})

popupApp.directive('settings', function() {
  return {
    restrict: 'C',
    link: function (scope, elements, attrs) {
      $(elements).on('click', function(event) {
        chrome.tabs.create({url: chrome.extension.getURL('options.html')});
        event.stopPropagation();
      });
    }
  }
})