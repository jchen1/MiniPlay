const musicStatus = {

  disabled_buttons: [],
  artist: '',
  album: '',
  album_art: '',
  title: '',
  current_time: '',
  total_time: '',
  current_time_s: 0,
  total_time_s: 0,
  thumb: '',
  repeat: '',
  shuffle: '',
  status: '',
  volume: '',
  queue: [],
  artist_id: '',
  album_id: '',
  protocol: 'gmusic',

  getTime(time) {
    return time.split(':').map((num, index, arr) => parseInt(num, 10) * (60 ** (arr.length - index - 1))).reduce((a, b) => a + b);
  },

  get_thumb() {
    if (document.querySelector('#player paper-icon-button[data-rating="5"]').getAttribute('title') === 'Undo thumb-up') {
      return ThumbEnum.UP;
    } else if (document.querySelector('#player paper-icon-button[data-rating="1"]').getAttribute('title') === 'Undo thumb-down') {
      return ThumbEnum.DOWN;
    }
    return ThumbEnum.NONE;
  },

  get_shuffle() {
    return (document.querySelector('#player paper-icon-button[data-id="shuffle"]').classList.contains('active'));
  },

  get_repeat() {
    switch (document.querySelector('#player paper-icon-button[data-id="repeat"]').getAttribute('title').split(' ')[1]) {
      case 'Off.': return RepeatEnum.NONE;
      case 'Current': return RepeatEnum.ONE;
      case 'All': return RepeatEnum.ALL;
      default: return RepeatEnum.NONE;
    }
  },

  get_queue() {
    const playlistRoot = document.querySelector('#queueContainer > .queue-song-table > .song-table > tbody');
    if (!playlistRoot) {
      return [];
    }

    const playlistCount = playlistRoot.getAttribute('data-count');
    const playlistArr = playlistRoot.querySelectorAll('.song-row');
    const playlist = [];

    for (let i = 0; i < playlistCount; i++) {
      const playlistItem = playlistArr[i];
      if (playlistItem === null) continue;

      const item = {};
      item.title = playlistItem.querySelector('.song-title').innerText;
      item.artist = playlistItem.querySelector('td[data-col="artist"] > span > a').innerText;
      item.album = playlistItem.querySelector('td[data-col="album"] > span > a').innerText;
      item.album_art = playlistItem.querySelector('span > img').getAttribute('src');
      item.total_time = playlistItem.querySelector('td[data-col="duration"] > span').innerText;
      item.total_time_s = this.getTime(item.total_time);

      item.play_count = playlistItem.querySelector('td[data-col="play-count"] > span');
      if (item.play_count === null) item.play_count = '0';

      item.currently_playing = playlistItem.classList.contains('currently-playing');

      item.id = playlistItem.getAttribute('data-id');

      playlist.push(item);
    }

    return playlist;
  },

  update() {
    this.title = document.querySelector('#currently-playing-title');
    this.title = (this.title === null) ? '' : this.title.innerText;

    this.artist = document.querySelector('#player-artist');
    this.artist = (this.artist === null) ? '' : this.artist.innerText;

    this.artist_id = document.querySelector('#player-artist');
    this.artist_id = (this.artist_id === null) ? '' : this.artist_id.getAttribute('data-id');

    this.album = document.querySelector('.player-album');
    this.album = (this.album === null) ? '' : this.album.innerText;

    this.album_id = document.querySelector('.player-album');
    this.album_id = (this.album_id === null) ? '' : this.album_id.getAttribute('data-id');

    this.album_art = document.querySelector('#playerBarArt');
    this.album_art = getAlbumArt((this.album_art === null) ? 'http://undefined' : this.album_art.getAttribute('src'));

    this.current_time = document.querySelector('#time_container_current');
    this.current_time = (this.current_time === null) ? '' : this.current_time.innerText;

    this.total_time = document.querySelector('#time_container_duration');
    this.total_time = (this.total_time === null) ? '' : this.total_time.innerText;

    this.current_time_s = this.getTime(this.current_time);
    this.total_time_s = this.getTime(this.total_time);
    this.thumb = this.get_thumb();
    this.shuffle = this.get_shuffle();
    this.repeat = this.get_repeat();
    this.status = document.querySelector('paper-icon-button[data-id="play-pause"]').getAttribute('title') === 'Pause' ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    this.volume = parseInt(document.querySelector('#material-vslider').getAttribute('aria-valuenow'), 10);
    this.queue = this.get_queue();
    return this;
  }
};
