popupApp.directive('mpSlider', () => {
  const secondsToHms = function(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? `${h}:` : '') + (m > 0 ? `${(h > 0 && m < 10 ? '0' : '') + m}:` : '0:') + (s < 10 ? '0' : '') + s);
  };

  return {
    restrict: 'C',
    link(scope, element, attrs) {
      $(element).on('mouseup', () => {
        if (scope.interfacePort) {
          scope.interfacePort.postMessage(
            {
              action: 'sendCommand',
              type: 'slider',
              position: $(element).val() / $(element).attr('max')
            });
        }
      }).on('input', () => {
        $('#current-time').html(secondsToHms($(element).val()));
      });

      scope.$watch(() => attrs.value, () => {
        if (element[0].MaterialSlider) {
          element[0].MaterialSlider.change(element[0].getAttribute('value'));
        }
        $(element).hide().show(0); // Force reflow
      });

      scope.$watch(() => scope.np.disabled.slider, value => {
        if (value === true) {
          $(element).add($(element).parent()).on('mousedown mouseup', false);
        } else {
          $(element).add($(element).parent()).off('mousedown mouseup', true);
        }
      });
    }
  };
});

popupApp.directive('mdlSwitch', () => ({
  restrict: 'A',
  link(scope, element, attrs) {
    scope.$watch(attrs.ngModel, (newValue, oldValue) => {
      const mdlSwitch = element[0].parentElement.MaterialSwitch;
      const func = (newValue) ? 'on' : 'off';
      const attr = element[0].getAttribute('ng-model').split('"')[1];

      if (mdlSwitch) mdlSwitch[func]();

      if (typeof (newValue) !== 'undefined') {
        const newSetting = {};
        newSetting[attr] = newValue;
        chrome.storage.sync.set(newSetting);
      }
    });
  }
}));

popupApp.directive('mpVolslider', () => ({
  restrict: 'C',
  link(scope, element, attrs) {
    $(element).on('input', event => {
      if (scope.interfacePort) {
        scope.interfacePort.postMessage(
          {
            action: 'sendCommand',
            type: 'vslider',
            position: $(element).val() / $(element).attr('max')
          });
      }
    });

    scope.$watch(() => attrs.value, () => {
      if (element[0].MaterialSlider) {
        element[0].MaterialSlider.change();
      }
      $(element).hide().show(0); // Force reflow
    });
  }
}));

popupApp.directive('mpScrollIf', () => {
  const getScrollingParent = function(element) {
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
    link(scope, element, attrs) {
      scope.$watch(() => scope.$eval(attrs.mpScrollIf), value => {
        if (value) {
          const sp = getScrollingParent(element[0]);
          if (sp) {
            sp.scrollTop = $(element[0]).offset().top - $(element[0]).height();
          }
        }
      });
    }
  };
});

popupApp.directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
      link(scope, elem, attrs) {
        let checkWhenEnabled;
        let handler;
        let scrollDistance;
        let scrollEnabled;
        $window = angular.element($window);
        $elem = $(elem);
        scrollDistance = 0;
        if (attrs.infiniteScrollDistance !== null) {
          scope.$watch(attrs.infiniteScrollDistance, value => {
            scrollDistance = parseInt(value, 10);
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled !== null) {
          scope.$watch(attrs.infiniteScrollDisabled, value => {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
            return false;
          });
        }
        handler = function() {
          const remaining = $elem.prop('scrollHeight') - $elem.height() - $elem.scrollTop();

          const shouldScroll = remaining <= $elem.height() * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.infiniteScroll);
            }
            return scope.$apply(attrs.infiniteScroll);
          } else if (shouldScroll) {
            checkWhenEnabled = true;
            return true;
          }
          return false;
        };
        $elem.on('scroll', handler);
        scope.$on('$destroy', () => $elem.off('scroll', handler));
        return $timeout((() => {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
          return false;
        }), 0);
      }
    };
  }
]);

// popupApp.directive('focusMe', $parse => ({
//   link(scope, element, attrs) {
//     scope.$watch($parse(attrs.focusMe), value => {
//       if (value === true) {
//         element[0].focus();
//       } else {
//         element[0].blur();
//       }
//     });
//   }
// }));

popupApp.directive('mpControl', () => ({
  restrict: 'A',
  link(scope, elements, attrs) {
    $(elements).on('click', event => {
      if (scope.interfacePort) {
        scope.interfacePort.postMessage(
          {
            action: 'sendCommand',
            type: event.currentTarget.getAttribute('id')
          });
        event.stopPropagation();
      }
    });
  }
}));
