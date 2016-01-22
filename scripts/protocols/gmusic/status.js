var music_status = {

  disabled_buttons : [],
  artist : '',
  album : '',
  album_art : '',
  title : '',
  current_time : '',
  total_time : '',
  current_time_s : 0,
  total_time_s: 0,
  thumb : '',
  repeat : '',
  shuffle : '',
  status : '',
  volume : '',
  playlist : [],
  artist_id: '',
  album_id: '',
  protocol : 'gmusic',

  get_time : function (time) {
    return time.split(':').map(function(num, index, arr) {
      return parseInt(num, 10) * Math.pow(60, arr.length - index - 1);
    }).reduce(function(a, b) { return a + b; });
  },

  get_thumb : function() {
    if (document.querySelector('paper-icon-button[data-rating="5"]').getAttribute('title') === 'Undo thumb-up') {
      return ThumbEnum.UP;
    }
    else if (document.querySelector('paper-icon-button[data-rating="1"]').getAttribute('title') === 'Undo thumb-down') {
      return ThumbEnum.DOWN;
    }
    else {
      return ThumbEnum.NONE;
    }
  },

  get_shuffle : function() {
    return (document.querySelector('paper-icon-button[data-id="shuffle"]').classList.contains('active'));
  },

  get_repeat : function() {
    switch (document.querySelector('paper-icon-button[data-id="repeat"]').getAttribute('title').split(' ')[1]) {
      case 'Off.': return RepeatEnum.NONE;
      case 'Current': return RepeatEnum.ONE;
      case 'All': return RepeatEnum.ALL;
    }
  },

  get_playlist : function() {
    var playlist_root = document.querySelector('#queueContainer > .queue-song-table > .song-table > tbody');
    if (!playlist_root) {
      return [];
    }

    var playlist_count = playlist_root.getAttribute('data-count');
    var playlist_arr = playlist_root.querySelectorAll('.song-row');
    var playlist = [];

    for (var i = 0; i < playlist_count; i++) {
      var playlist_item = playlist_arr[i];
      if (playlist_item == null) continue;
      
      var item = {};
      item.title = playlist_item.querySelector('.song-title').innerText;
      item.artist = playlist_item.querySelector('td[data-col="artist"] > span > a').innerText;
      item.album = playlist_item.querySelector('td[data-col="album"] > span > a').innerText;
      item.album_art = playlist_item.querySelector('span > img').getAttribute('src');
      item.total_time = playlist_item.querySelector('td[data-col="duration"] > span').innerText;
      item.total_time_s = this.get_time(item.total_time);

      item.play_count = playlist_item.querySelector('td[data-col="play-count"] > span');
      if (item.play_count == null) item.play_count = '0';

      item.currently_playing = playlist_item.classList.contains('currently-playing');

      item.id = playlist_item.getAttribute('data-id');

      playlist.push(item);
    }

    return playlist;
  },

  update : function() {
    this.title = document.querySelector('#currently-playing-title');
    this.title = (this.title == null) ? '' : this.title.innerText;

    this.artist = document.querySelector('#player-artist');
    this.artist = (this.artist == null) ? '' : this.artist.innerText;

    this.artist_id = document.querySelector('#player-artist');
    this.artist_id = (this.artist_id == null) ? '' : this.artist_id.getAttribute('data-id');

    this.album = document.querySelector('.player-album');
    this.album = (this.album == null) ? '' : this.album.innerText;

    this.album_id = document.querySelector('.player-album');
    this.album_id = (this.album_id == null) ? '' : this.album_id.getAttribute('data-id');

    this.album_art = document.querySelector('#playerBarArt');
    this.album_art = get_album_art((this.album_art == null) ? 'http://undefined' : this.album_art.getAttribute('src'));

    this.current_time = document.querySelector('#time_container_current');
    this.current_time = (this.current_time == null) ? '' : this.current_time.innerText;

    this.total_time = document.querySelector('#time_container_duration');
    this.total_time = (this.total_time == null) ? '' : this.total_time.innerText;

    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.get_time(this.total_time);
    this.thumb = this.get_thumb();
    this.shuffle = this.get_shuffle();
    this.repeat = this.get_repeat();
    this.status = document.querySelector('paper-icon-button[data-id="play-pause"]').getAttribute('title') == 'Pause' ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    this.volume = parseInt(document.querySelector('#material-vslider').getAttribute('aria-valuenow'));
    this.playlist = this.get_playlist();
    return this;
  }
};
