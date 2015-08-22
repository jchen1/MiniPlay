var music_status = {

  disabled_buttons : ['slider', 'down', 'shuffle', 'playlist'],
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
  protocol : 'soundcloud',

  get_time : function (time) {
    return time.split(':').map(function(num, index, arr) {
      return parseInt(num, 10) * Math.pow(60, arr.length - index - 1);
    }).reduce(function(a, b) { return a + b; });
  },

  get_album_art : function() {
    var art = $('.playbackSoundBadge__avatar > .image > span').css('background-image');
    return (!art || art == '') ? 'img/default_album.png' : art.substring(4, art.length - 1);
  },

  get_thumb : function() {
    if ($('.sc-button-like').attr('title') == 'Unlike') {
      return ThumbEnum.UP;
    }
    else {
      return ThumbEnum.NONE;
    }
  },

  get_repeat : function() {
    if ($('.repeatControl').hasClass('m-active')) {
      return RepeatEnum.ONE;
    }
    else {
      return RepeatEnum.NONE;
    }
  },

  update : function() {
    this.title = $('.playbackSoundBadge__title').attr('title');
    this.album_art = this.get_album_art();
    this.current_time = $('.playbackTimeline__timePassed > span[aria-hidden="true"]').text();
    this.total_time = $('.playbackTimeline__duration > span[aria-hidden="true"]').text();
    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.get_time(this.total_time);
    this.thumb = this.get_thumb();
    this.repeat = this.get_repeat();
    this.status = $('.playControl').attr('title') == 'Pause current' ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    this.volume = parseInt($('.volume__sliderWrapper').attr('aria-valuenow'));
    this.slider_updated = false;
    this.vslider_updated = false;
    return this;
  }
};
