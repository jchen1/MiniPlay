var music_status = {

  artist : '',
  album : '',
  album_art : '',
  title : '',
  current_time : '',
  total_time : '',
  current_time_s : '',
  total_time_s: '',
  thumb : '',
  repeat : '',
  shuffle : '',
  status : '',

  get_time : function (time) {
    var time = (parseInt(time.split(':')[0]) * 60) + parseInt(time.split(':')[1]);
    return (isNaN(time) ? 0 : time);
  },

  update : function() {
    this.title = $("#playerSongTitle").text();
    this.artist = $("#player-artist").text();
    this.album = $(".player-album").text();
    this.album_art = "http://" + $("#playingAlbumArt").attr('src');
    this.current_time = $("#time_container_current").text();
    this.total_time = $("#time_container_duration").text();
    this.current_time_s = get_time(this.current_time);
    this.total_time_s = get_time(this.total_time);
    this.shuffle = $('button[data-id="shuffle"]').attr("value");
    this.repeat = $('button[data-id="repeat"]').attr("value");
    this.thumb = $('.thumbs > .selected').attr('data-rating');
    this.status = $('button[data-id="play-pause"]').attr('title');

    return this;
  }
};
