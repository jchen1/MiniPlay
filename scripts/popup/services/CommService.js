angular.module('app').factory('CommService', $rootScope => {
  let hasInit = false;
  let backgroundPort;
  let interfacePort;
  const pendingRequests = {};

  function uuid(a) {
    // eslint-disable-next-line
    return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid);
  }

  function routeInterfaceMsg(msg) {
    msg.uuid = msg.uuid || 'none';
    if (chrome.extension.lastError) {
      if (pendingRequests[msg.uuid]) {
        pendingRequests[msg.uuid].reject(new Error('unknown error'));
      }
      return $rootScope.$broadcast('msg:status', { state: StateEnum.NO_TAB });
    }
    if (pendingRequests[msg.uuid]) {
      pendingRequests[msg.uuid].resolve(msg);
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
      const promise = new Promise((resolve, reject) => {
        if (!hasInit) {
          reject(new Error('CommService has not been initialized!'));
        } else if (!interfacePort) {
          reject(new Error('No music tab found'));
        } else {
          msg.uuid = msg.uuid || uuid();
          pendingRequests[msg.uuid] = { resolve, reject };
          interfacePort.postMessage(msg);
        }
      });

      return promise;
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
