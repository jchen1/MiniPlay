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
    var url = getComputedStyle(document.querySelector('#app-player').contentDocument.querySelector('.sp-image-img'))['background-image'];
    return url ? url.substring(url.search('http'), url.indexOf(')') - 1) : 'img/default_album.png';
  },

  update : function() {
    var iframe = document.querySelector('#app-player').contentDocument;
    this.title = iframe.querySelector('#track-name > a').innerText;
    this.artist = iframe.querySelector('#track-artist > a').innerText;
    this.album_art = this.get_album_art();
    this.current_time = iframe.querySelector('#track-current').innerText;
    this.total_time = iframe.querySelector('#track-length').innerText;
    this.current_time_s = this.get_time(this.current_time);
    this.total_time_s = this.get_time(this.total_time);
    this.repeat = iframe.querySelector('#repeat').classList.contains('active') ? RepeatEnum.ALL : RepeatEnum.NONE;
    this.shuffle = iframe.querySelector('#shuffle').classList.contains('active');
    this.status = (iframe.querySelector('#play-pause').classList.contains('playing')) ? StatusEnum.PLAYING : StatusEnum.PAUSED;
    this.volume = parseFloat(getComputedStyle(iframe.querySelector('#vol-position')).left, 10) / 108 * 100;
    return this;
  }
};
