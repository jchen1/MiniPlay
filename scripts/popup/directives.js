angular.module('app').directive('mpSlider', CommService => {
  const secondsToHms = function(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor((d % 3600) / 60);
    const s = Math.floor(d % 3600 % 60);
    return ((h > 0 ? `${h}:` : '') + (m > 0 ? `${(h > 0 && m < 10 ? '0' : '') + m}:` : '0:') + (s < 10 ? '0' : '') + s);
  };
  CommService.init();

  return {
    restrict: 'C',
    link(scope, element, attrs) {
      $(element).on('mouseup', () => {
        CommService.postMessage({
          action: 'sendCommand',
          type: 'slider',
          position: $(element).val() / $(element).attr('max')
        });
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

angular.module('app').directive('mdlSwitch', SettingsManager => ({
  restrict: 'A',
  link(scope, element, attrs) {
    const settingName = attrs['mdl-switch'];
    let firstRun = true;  // Don't set it here since the MaterialSwitch hasn't been initialized yet
    SettingsManager.init();
    scope.$watch(() => element.parent().attr('class').includes('is-checked'), (newValue, oldValue) => {
      if (firstRun) {
        const ms = element.parent()[0].MaterialSwitch;
        const funcName = SettingsManager.get(settingName) ? 'on' : 'off';
        ms[funcName]();
        firstRun = false;
      } else {
        SettingsManager.set(settingName, newValue);
      }
    });
  }
}));

angular.module('app').directive('mpVolslider', CommService => ({
  restrict: 'C',
  link(scope, element, attrs) {
    CommService.init();
    $(element).on('input', event => {
      CommService.postMessage({
        action: 'sendCommand',
        type: 'vslider',
        position: $(element).val() / $(element).attr('max')
      });
    });

    scope.$watch(() => attrs.value, () => {
      if (element[0].MaterialSlider) {
        element[0].MaterialSlider.change();
      }
      $(element).hide().show(0); // Force reflow
    });
  }
}));

angular.module('app').directive('mpScrollIf', () => {
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

angular.module('app').directive('infiniteScroll', [
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

angular.module('app').directive('focusMe', $parse => ({
  link(scope, element, attrs) {
    scope.$watch($parse(attrs.focusMe), value => {
      if (value === true) {
        element[0].focus();
      } else {
        element[0].blur();
      }
    });
  }
}));

angular.module('app').directive('mpControl', CommService => ({
  restrict: 'A',
  link(scope, elements, attrs) {
    CommService.init();
    $(elements).on('click', event => {
      CommService.postMessage({
        action: 'sendCommand',
        type: event.currentTarget.getAttribute('id')
      });
      event.stopPropagation();
    });
  }
}));
