angular.module('app').factory('CommService', ($interval, $rootScope) => {
  let hasInit = false;
  let backgroundPort;
  let interfacePort;

  function routeInterfaceMsg(msg) {
    if (chrome.extension.lastError) {
      return $rootScope.$broadcast('msg:status', { state: StateEnum.NO_TAB });
    }
    return $rootScope.$broadcast(`msg:${msg.type}`, msg);
  }

  const interfaceListeners = { routeInterfaceMsg };

  function init() {
    if (hasInit) return;

    hasInit = true;
    backgroundPort = chrome.runtime.connect({ name: 'popup' });
    backgroundPort.onMessage.addListener(msg => {
      if (msg.type === 'connect') {
        interfacePort = chrome.tabs.connect(msg.id, { name: 'popup' });
        interfacePort.id = msg.id;
        interfacePort.onDisconnect.addListener(() => {
          interfacePort = null;
          $rootScope.$broadcast('comm-service:disconnect');
        });
        _.each(interfaceListeners, listener => interfacePort.onMessage.addListener(listener));
        $rootScope.$broadcast('comm-service:connect');
      }
    });
  }

  return {
    init,
    addInterfaceListener(name, listener) {
      if (interfaceListeners[name]) {
        console.warn(`Not adding already existing listener with name ${name}!`);
      } else {
        interfaceListeners[name] = listener;
      }
    },
    removeInterfaceListener(name) {
      _.unset(interfaceListeners, name);
    },
    postMessage(msg) {
      if (hasInit && interfacePort) {
        interfacePort.postMessage(msg);
      }
    },
    isConnected() {
      return !_.isNil(interfacePort);
    },
    getTabId() {
      if (hasInit && interfacePort) {
        return interfacePort.id;
      }
      return -1;
    }
  };
});
