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
      $(element).on('mouseup', function() {
        if (scope.interface_port) {
          scope.interface_port.postMessage(
          {
            'action': 'send_command',
            'type': 'slider',
            'position': $(element).val() / $(element).attr('max')
          });
        }
      }).on('input', function() {
        $('#current-time').html(secondsToHms($(element).val()));
      });

      scope.$watch(function() {
        return attrs.value;
      }, function() {
        if (element[0].MaterialSlider) {
          element[0].MaterialSlider.change(element[0].getAttribute('value'));
        }
        $(element).hide().show(0); // Force reflow
      });

      scope.$watch(function() {
        return scope.music_status.disabled['slider'];
      }, function(value) {
        if (value === true) {
          $(element).add($(element).parent()).on('mousedown mouseup', false);
        }
        else {
          $(element).add($(element).parent()).off('mousedown mouseup', true);
        }
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

      scope.$watch(function() {
        return attrs.value;
      }, function() {
        if (element[0].MaterialSlider) {
          element[0].MaterialSlider.change();
        }
        $(element).hide().show(0); // Force reflow
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
          if (sp) {
            sp.scrollTop = $(element[0]).offset().top;
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
