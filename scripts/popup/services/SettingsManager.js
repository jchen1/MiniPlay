angular.module('app').factory('SettingsManager', $rootScope => {
  const settings = {};
  const settingNames = ['shortcuts-enabled', 'notifications-enabled', 'scrobbling-enabled', 'lastfm_sessionID'];
  let hasInit = false;

  function init() {
    if (hasInit) return;
    hasInit = true;
    chrome.storage.sync.get(settingNames, data => {
      _.extend(settings, data);
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      let changed = false;
      if (area === 'sync') {
        _.each(settingNames, setting => {
          if (changes[setting] && settings[setting] !== changes[setting].newValue) {
            settings[setting] = changes[setting].newValue;
            changed = true;
          }
        });
      }
      if (changed) {
        $rootScope.$broadcast('settings-manager:updated', settings);
      }
    });
  }

  function get(key) {
    return key ? settings[key] : settings;
  }

  function set(key, value) {
    if (settingNames.indexOf(key) === -1) {
      console.warn(`No setting with name ${key}.`);
      return null;
    } else if (settings[key] === value) {
      return null;
    }
    const obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj);
    return value;
  }

  return {
    init,
    get,
    set,
    settingNames,
    getSet(key) {
      return function(newValue) {
        const ret = _.isUndefined(newValue) ? get(key) : (set(key, newValue));
        return ret;
      };
    }
  };
});
