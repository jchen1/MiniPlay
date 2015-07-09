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
    this.slider_updated = false;
    this.vslider_updated = false;
    return this;
  }
};
