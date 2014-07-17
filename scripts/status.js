var music_status = {

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

  get_time : function (time) {
    return time.split(':').map(function(num, index, arr) {
      return parseInt(num, 10) * Math.pow(60, arr.length - index - 1);
    }).reduce(function(a, b) { return a + b; });
  },

  update : function() {
    this.title = $('#playerSongTitle').text();
    this.artist = $('#player-artist').text();
    this.album = $('.player-album').text();
    this.album_art = 'http://' + $('#playingAlbumArt').attr('src');
    this.current_time = $('#time_container_current').text();
    this.total_time = $('#time_container_duration').text();
    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.get_time(this.total_time);
    this.shuffle = $('button[data-id="shuffle"]').attr('value');
    this.repeat = $('button[data-id="repeat"]').attr('value');
    this.thumb = $('.thumbs > .selected').attr('data-rating');
    this.status = $('button[data-id="play-pause"]').attr('title');
    this.volume = parseInt($('.goog-slider-thumb').css('left'), 10) / (parseInt($('.volume-slider-background').css('width'), 10) - parseInt($('.goog-slider-thumb').css('width'), 10));

    return this;
  }
};
