var music_status = {

  artist : '',
  album : '',
  album_art : '',
  title : '',
  current_time : '',
  total_time : '',
  thumb : '',
  repeat : '',
  shuffle : '',
  status : '',

  update : function() {
    this.title = $("#playerSongTitle").text();
    this.artist = $("#player-artist").text();
    this.album = $(".player-album:first").text();
    this.album_art = "http://" + $("#playingAlbumArt").attr('src');
    this.current_time = $("#time_container_current").text();
    this.total_time = $("#time_container_duration").text();
    var status = 'Play', thumb = 'None', repeat = 'none', shuffle = 'off';
    if ($('button[data-id="play-pause"]').hasClass('playing')) {
      // console.log('this is playing');
      status = 'Pause';
    }
    if ($('li[title="Thumbs up"]').hasClass('selected')) {
      thumb = 'Up';
    }
    if ($('li[title="Thumbs down"]').hasClass('selected')) {
      thumb = 'Down';
    }

    if ($('button[data-id="shuffle"]').attr("value") == "ALL_SHUFFLE") {
      shuffle = 'on';
    }
    if ($('button[data-id="repeat"]').attr("value") == "LIST_REPEAT") {
      repeat = 'list';
    }
    if ($('button[data-id="repeat"]').attr("value") == "SINGLE_REPEAT") {
      repeat = 'single';
    }
    this.status = status;
    this.thumb = thumb;
    this.shuffle = shuffle;
    this.repeat = repeat;

    return this;
  }
};