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
  slider_updated : false,
  vslider_updated : false,
  playlist : [],
  protocol : 'gmusic',

  get_time : function (time) {
    return time.split(':').map(function(num, index, arr) {
      return parseInt(num, 10) * Math.pow(60, arr.length - index - 1);
    }).reduce(function(a, b) { return a + b; });
  },

  get_album_art : function() {
    var art = $('#playingAlbumArt').attr('src');
    return (!art || art == 'http://undefined') ? 'img/default_album.png' : art.substring(0, art.search('=') + 1) + 's320';
  },

  get_thumb : function() {
    if ($('sj-icon-button[data-rating="5"]').attr('title') == 'Undo thumb-up') {
      return "5";
    }
    else if ($('sj-icon-button[data-rating="1"]').attr('title') == 'Undo thumb-down') {
      return "1";
    }
    else {
      return "0";
    }
  },

  get_playlist : function() {
    var playlist_root = $('#queue-container > .queue-song-table > .song-table > tbody');
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

      playlist.push(item);
    }

    return playlist;
  },

  update : function() {
    this.title = $('#player-song-title').text();
    this.artist = $('#player-artist').text();
    this.album = $('.player-album').text();
    this.album_art = this.get_album_art();
    this.current_time = $('#time_container_current').text();
    this.total_time = $('#time_container_duration').text();
    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.get_time(this.total_time);
    this.shuffle = $('sj-icon-button[data-id="shuffle"]').attr('value');
    this.repeat = $('sj-icon-button[data-id="repeat"]').attr('value');
    this.thumb = this.get_thumb();
    this.status = $('sj-icon-button[data-id="play-pause"]').attr('title');
    this.volume = parseInt($('#material-vslider').attr('aria-valuenow')) / 100.0;
    this.playlist = this.get_playlist();
    this.slider_updated = false;
    this.vslider_updated = false;
    return this;
  }
};
