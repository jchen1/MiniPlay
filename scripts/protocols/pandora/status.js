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
  thumb: '',
  repeat: RepeatEnum.NONE,
  shuffle: false,
  status: '',
  volume: '',
  protocol: 'pandora',

  getTime(time) {
    return time.split(':').map((num, index, arr) => Math.abs(parseInt(num, 10) * (60 ** (arr.length - index - 1)))).reduce((a, b) => a + b);
  },

  getAlbumArt() {
    const array = document.querySelectorAll('.slidesForeground .art');
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      if (getComputedStyle(item).display === 'inline') {
        return item.getAttribute('src');
      }
    }
    return 'img/default_album.png';
  },

  get_thumb() {
    if (document.querySelector('.thumbUpButton').classList.contains('indicator')) {
      return ThumbEnum.UP;
    } else if (document.querySelector('.thumbDownButton').classList.contains('indicator')) {
      return ThumbEnum.DOWN;
    }
    return ThumbEnum.NONE;
  },

  update() {
    this.title = document.querySelector('.playerBarSong').innerText;
    this.artist = document.querySelector('.playerBarArtist').innerText;
    this.album = document.querySelector('.playerBarAlbum').innerText;
    this.album_art = this.getAlbumArt();
    this.current_time = document.querySelector('.elapsedTime').innerText;
    this.total_time = document.querySelector('.remainingTime').innerText;
    this.current_time_s = this.getTime(this.current_time);
    this.total_time_s = this.current_time_s + this.getTime(this.total_time);
    this.thumb = this.get_thumb();
    this.volume = (parseInt(getComputedStyle(document.querySelector('.volumeKnob')).left, 10) - 20) / 82 * 100;
    this.status = (getComputedStyle(document.querySelector('.playButton')).display === 'none') ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    return this;
  }
};
