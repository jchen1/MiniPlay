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
  protocol : 'gmusic',

  get_time : function (time) {
    return time.split(':').map(function(num, index, arr) {
      return parseInt(num, 10) * Math.pow(60, arr.length - index - 1);
    }).reduce(function(a, b) { return a + b; });
  },

  get_thumb : function() {
    if ($('paper-icon-button[data-rating="5"]').attr('title') == 'Undo thumb-up') {
      return ThumbEnum.UP;
    }
    else if ($('paper-icon-button[data-rating="1"]').attr('title') == 'Undo thumb-down') {
      return ThumbEnum.DOWN;
    }
    else {
      return ThumbEnum.NONE;
    }
  },

  get_shuffle : function() {
    return ($('paper-icon-button[data-id="shuffle"]').hasClass('active'));
  },

  get_repeat : function() {
    switch ($('paper-icon-button[data-id="repeat"]').attr('title').split(' ')[1]) {
      case 'Off.': return RepeatEnum.NONE;
      case 'Current': return RepeatEnum.ONE;
      case 'All': return RepeatEnum.ALL;
    }
  },

  get_playlist : function() {
    var playlist_root = $('#queueContainer > .queue-song-table > .song-table > tbody');
    var playlist_count = playlist_root.attr('data-count');
    var playlist_arr = playlist_root.find('.song-row');
    var playlist = [];

    if (!playlist_count) {
      return [];
    }

    for (var i = 0; i < playlist_count; i++) {
      var playlist_item = $(playlist_arr[i]);
      var item = {};
      item.title = playlist_item.find('.song-title').text();
      item.artist = playlist_item.find('td[data-col="artist"] > span > a').text();
      item.album = playlist_item.find('td[data-col="album"] > span > a').text();
      item.album_art = playlist_item.find('span > img').attr('src');
      item.total_time = playlist_item.find('td[data-col="duration"] > span').text();
      item.total_time_s = this.get_time(item.total_time);

      item.play_count = playlist_item.find('td[data-col="play-count"] > span').text();
      item.currently_playing = playlist_item.hasClass('currently-playing');

      item.id = playlist_item.attr('data-id');

      playlist.push(item);
    }

    return playlist;
  },

  update : function() {
    this.title = $('#currently-playing-title').text();
    this.artist = $('#player-artist').text();
    this.album = $('.player-album').text();
    this.album_art = get_album_art($('#playerBarArt').attr('src'));
    this.current_time = $('#time_container_current').text();
    this.total_time = $('#time_container_duration').text();
    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.get_time(this.total_time);
    this.thumb = this.get_thumb();
    this.shuffle = this.get_shuffle();
    this.repeat = this.get_repeat();
    this.status = $('paper-icon-button[data-id="play-pause"]').attr('title') == 'Pause' ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    this.volume = parseInt($('#material-vslider').attr('aria-valuenow'));
    this.playlist = this.get_playlist();
    return this;
  }
};
