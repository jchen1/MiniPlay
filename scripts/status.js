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
    this.album = $(".player-album").text();
    this.album_art = "http://" + $("#playingAlbumArt").attr('src');
    this.current_time = $("#time_container_current").text();
    this.total_time = $("#time_container_duration").text();
    this.shuffle = $('button[data-id="shuffle"]').attr("value");  //NO_SHUFFLE, ALL_SHUFFLE
    this.repeat = $('button[data-id="repeat"]').attr("value");  //NO_REPEAT, SINGLE_REPEAT, LIST_REPEAT
    this.status = 'paused';
    this.thumb = 'None';
    this.repeat = 'none';
    if ($('button[data-id="play-pause"]').hasClass('playing')) {
      this.status = 'playing';
    }
    if ($('li[title="Thumbs up"]').hasClass('selected')) {
      this.thumb = 'Up';
    }
    if ($('li[title="Thumbs down"]').hasClass('selected')) {
      this.thumb = 'Down';
    }
    if ($('button[data-id="repeat"]').attr("value") == "LIST_REPEAT") {
      this.repeat = 'list';
    }
    if ($('button[data-id="repeat"]').attr("value") == "SINGLE_REPEAT") {
      this.repeat = 'single';
    }

    return this;
  }
};
