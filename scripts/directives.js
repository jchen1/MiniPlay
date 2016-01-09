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
            action: 'send_command',
            type: 'slider',
            position: $(element).val() / $(element).attr('max')
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

popupApp.directive('mdlSwitch', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      scope.$watch(attrs.ngModel, function(newValue, oldValue) {
        var mdl_switch = element[0].parentElement.MaterialSwitch;
        var func = (newValue) ? 'on' : 'off';
        var attr = element[0].getAttribute('ng-model').split('"')[1];

        if (mdl_switch) mdl_switch[func]();

        console.log(attr + ', ' + newValue);

        if (typeof(newValue) !== 'undefined') {
          var new_setting = {};
          new_setting[attr] = newValue;
          chrome.storage.sync.set(new_setting);
        }
      });
    }
  }
})

popupApp.directive('mpVolslider', function() {
  return {
    restrict: 'C',
    link: function (scope, element, attrs) {
      $(element).on('input', function(event) {
        if (scope.interface_port) {
          scope.interface_port.postMessage(
          {
            action: 'send_command',
            type: 'vslider',
            position: $(element).val() / $(element).attr('max')
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
            sp.scrollTop = $(element[0]).offset().top - $(element[0]).height();
          }
        }
      });
    }
  }
});

popupApp.directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
        $window = angular.element($window);
        $elem = $(elem);
        scrollDistance = 0;
        if (attrs.infiniteScrollDistance != null) {
          scope.$watch(attrs.infiniteScrollDistance, function(value) {
            return scrollDistance = parseInt(value, 10);
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled != null) {
          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        handler = function() {
          var remaining = $elem.prop('scrollHeight') - $elem.height() - $elem.scrollTop();

          var shouldScroll = remaining <= $elem.height() * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.infiniteScroll);
            } else {
              return scope.$apply(attrs.infiniteScroll);
            }
          } else if (shouldScroll) {
            return checkWhenEnabled = true;
          }
        };
        $elem.on('scroll', handler);
        scope.$on('$destroy', function() {
          return $elem.off('scroll', handler);
        });
        return $timeout((function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        }), 0);
      }
    };
  }
]);

popupApp.directive('focusMe', function($parse) {
  return {
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if (value === true) {
          element[0].focus();
        }
        else {
          element[0].blur();
        }
      });
    }
  };
});

popupApp.directive('mpControl', function() {
  return {
    restrict: 'A',
    link: function (scope, elements, attrs) {
      $(elements).on('click', function(event) {
        if (scope.interface_port) {
          scope.interface_port.postMessage(
          {
            action: 'send_command',
            type: event.currentTarget.getAttribute('id')
          });
          event.stopPropagation();
        }
      });
    }
  }
});
