var music_status = {

  disabled_buttons : ['rew', 'repeat', 'shuffle', 'slider'],
  artist : '',
  album : '',
  album_art : '',
  title : '',
  current_time : '',
  total_time : '',
  current_time_s : 0,
  total_time_s: 0,
  thumb : '',
  repeat : RepeatEnum.NONE,
  shuffle : false,
  status : '',
  volume : '',
  protocol : 'pandora',

  get_time : function (time) {
    return time.split(':').map(function(num, index, arr) {
      return Math.abs(parseInt(num, 10) * Math.pow(60, arr.length - index - 1));
    }).reduce(function(a, b) { return a + b; });
  },

  get_album_art : function () {
    var array = document.querySelectorAll('.slidesForeground .art');
    for (var i = 0; i < array.length; i++) {
      var item = array[i];
      if (getComputedStyle(item).display == 'inline') {
        return item.getAttribute('src');
      }
    }
    return 'img/default_album.png';
  },

  get_thumb : function () {
    if (document.querySelector('.thumbUpButton').classList.contains('indicator')) {
      return ThumbEnum.UP;
    }
    else if (document.querySelector('.thumbDownButton').classList.contains('indicator')) {
      return ThumbEnum.DOWN;
    }
    else {
      return ThumbEnum.NONE;
    }
  },

  update : function() {
    this.title = document.querySelector('.playerBarSong').innerText;
    this.artist = document.querySelector('.playerBarArtist').innerText;
    this.album = document.querySelector('.playerBarAlbum').innerText;
    this.album_art = this.get_album_art();
    this.current_time = document.querySelector('.elapsedTime').innerText;
    this.total_time = document.querySelector('.remainingTime').innerText;
    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.current_time_s + this.get_time(this.total_time);
    this.thumb = this.get_thumb();
    this.volume = (parseInt(getComputedStyle(document.querySelector('.volumeKnob')).left, 10) - 20) / 82 * 100;
    this.status = (getComputedStyle(document.querySelector('.playButton')).display == "none") ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    return this;
  }
};
