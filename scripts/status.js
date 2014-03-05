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
    this.status = 'paused';
    this.thumb = 'None';
    this.repeat = 'none';
    this.shuffle = 'off;'
    if ($('button[data-id="play-pause"]').hasClass('playing')) {
      this.status = 'playing';
    }
    if ($('li[title="Thumbs up"]').hasClass('selected')) {
      this.thumb = 'Up';
    }
    if ($('li[title="Thumbs down"]').hasClass('selected')) {
      this.thumb = 'Down';
    }

    if ($('button[data-id="shuffle"]').attr("value") == "ALL_SHUFFLE") {
      this.shuffle = 'on';
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