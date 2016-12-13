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
    var artworkDOM = document.querySelector('div.now-playing');
    var artworkURL = null;

    if (artworkDOM) {
      var bgImage = artworkDOM.querySelector('.cover-art-image').style['background-image'];
      artworkURL = bgImage.substring(bgImage.search('http'), bgImage.indexOf(')') - 1);
    }

    return artworkURL ? artworkURL : 'img/default_album.png';
  },

  get_play_pause_status: function() {
    var pauseButton = document.querySelector('.spoticon-pause-32');
    var playButton = document.querySelector('.spoticon-play-32');

    return playButton ? StatusEnum.PAUSED : StatusEnum.PLAYING;
  },

  update : function() {

    var nowPlayingContent = document.querySelector('.now-playing');
    var trackInfo = nowPlayingContent.querySelector('.track-info');

    this.title = trackInfo.querySelector('.track-info-name > a').innerText;
    this.artist = trackInfo.querySelector('.track-info-artists > span > a').innerText;
    this.album_art = this.get_album_art();
    this.protocol = 'spotify';
    this.status = this.get_play_pause_status();

    var volumeStr = document.querySelector('.volume-bar > div > div > div').style.width;
    this.volume = parseInt(volumeStr.substring(0, volumeStr.length - 2));

    return this;
  }
};
