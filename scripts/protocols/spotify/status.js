var music_status = {

  disabled_buttons : ['up', 'down'],
  artist : '',
  album : '',
  album_art : '',
  title : '',
  current_time : '',
  total_time : '',
  current_time_s : 0,
  total_time_s: 0,
  thumb : ThumbEnum.NONE,
  repeat : 'NO_REPEAT',
  shuffle : false,
  status : '',
  volume : '',
  protocol : 'spotify',

  get_time : function (time) {
    return time.split(':').map(function(num, index, arr) {
      return Math.abs(parseInt(num, 10) * Math.pow(60, arr.length - index - 1));
    }).reduce(function(a, b) { return a + b; });
  },

  get_album_art : function () {
    var url = $('#app-player').contents().find('.sp-image-img').css('background-image');
    return url ? url.substring(url.search('http'), url.indexOf(')')) : 'img/default_album.png';
  },

  update : function() {
    var iframe = $('#app-player').contents();
    this.title = iframe.find('#track-name > a').text();
    this.artist = iframe.find('#track-artist > a').text();
    // this.album = $('.playerBarAlbum').text();
    this.album_art = this.get_album_art();
    this.current_time = iframe.find('#track-current').text();
    this.total_time = iframe.find('#track-length').text();
    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.get_time(this.total_time);
    this.repeat = iframe.find('#repeat').hasClass('active') ? RepeatEnum.ALL : RepeatEnum.NONE;
    this.shuffle = iframe.find('#shuffle').hasClass('active');
    this.status = (iframe.find('#play-pause').hasClass('playing')) ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    this.volume = parseFloat(iframe.find('#vol-position').css('left'), 10) / 108 * 100;
    return this;
  }
};
