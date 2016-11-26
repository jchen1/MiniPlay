const musicStatus = {

  disabled_buttons: ['rew', 'repeat', 'shuffle', 'slider'],
  artist: '',
  album: '',
  album_art: '',
  title: '',
  current_time: '',
  total_time: '',
  current_time_s: 0,
  total_time_s: 0,
  thumb: ThumbEnum.NONE,
  repeat: RepeatEnum.NONE,
  shuffle: false,
  status: '',
  volume: '',
  protocol: 'songza',

  getTime(time) {
    return time.split(':').map((num, index, arr) => parseInt(num, 10) * (60 ** (arr.length - index - 1))).reduce((a, b) => a + b);
  },

  get_album() {
    const album = $('.miniplayer-info-album-title').text();
    return album.length > 5 ? album.substring(5) : '';
  },

  getAlbumArt() {
    const art = $('.fullplayer-song-wrapper.active > .fullplayer-album-art').attr('src');
    return (art === 'http://undefined') ? 'img/default_album.png' : art;
  },

  get_thumb() {
    if ($('.thumb-up').hasClass('voted')) {
      return ThumbEnum.UP;
    } else if ($('.thumb-down').hasClass('voted')) {
      return ThumbEnum.DOWN;
    }
    return ThumbEnum.NONE;
  },

  update() {
    this.title = $('.miniplayer-info-track-title > a').text();
    this.artist = $('.miniplayer-info-artist-name > a').text();
    this.album = this.get_album();
    this.album_art = this.getAlbumArt();
    this.current_time_s = parseFloat($('.miniplayer-timeline-current-time').css('width'));
    this.total_time_s = parseInt($('.miniplayer-timeline').css('width'), 10);
    this.thumb = this.get_thumb();
    this.status = $('.player-wrapper').hasClass('player-state-play') ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    this.volume = parseFloat($('#volume-control-slider-input').val());
    return this;
  }
};
