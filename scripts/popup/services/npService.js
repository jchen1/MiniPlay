angular.module('app').factory('NPService', ($interval, $rootScope) => {
  const status = {
    title: '',
    artist: '',
    album: '',
    album_art: 'img/default_album.png',
    shuffle: false,
    repeat: RepeatEnum.NONE,
    current_time: '',
    total_time: '',
    current_time_s: 0,
    total_time_s: 0,
    status: StatusEnum.PAUSED,
    disabled: {},
    volume: 100,
    thumb: ThumbEnum.NONE,
    artist_id: '',
    album_id: '',
    protocol: '',
    current_color: ColorEnum.none
  };

  const queue = [];
  let disabled = {};
  let state = StateEnum.NO_TAB;

  function update(event, { data: updated }) {
    if (updated.state) {
      state = updated.state;
      return $rootScope.$broadcast('np-service:updated', { state, status, queue, disabled });
    }

    const newQueue = updated.queue;
    const newDisabled = updated.disabled;
    const pickedUpdated = _.omit(updated, 'queue', 'disabled', 'state', 'last_color');
    status.oldColor = status.color;
    _.extend(status, pickedUpdated);
    status.color = ColorEnum[status.protocol] || ColorEnum.none;

    _.each(newQueue, (item, index) => {
      const oldItem = queue[index] || {};
      if (item.title &&
          item.title !== oldItem.title &&
          item.currently_playing !== oldItem.currently_playing) {
        queue[index] = _.extend({}, item, { index });
      }
    });
    disabled = {};
    _.each(newDisabled, item => {
      disabled[item] = true;
    });

    if (status.title === '') {
      state = StateEnum.NO_SONG;
    } else {
      state = StateEnum.PLAYING;
    }
    return $rootScope.$broadcast('np-service:updated', { state, status, queue, disabled });
  }

  $rootScope.$on('msg:status', update);

  return {
    get() {
      return { status, queue, disabled };
    }
  };
});
