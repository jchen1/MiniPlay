var artist_map = [
{
  name: 'name',
  selector: 'a',
  property: 'innerText',
  if_null: ''
},
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_artist.png'
}];

var album_map = [
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'artist',
  selector: '.sub-title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

var station_map = [
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

var recent_map = [
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'subtitle',
  selector: '.sub-title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

var playlist_map = [
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'title',
  selector: '.title',
  property: 'innerText',
  if_null: ''
},
{
  name: 'image',
  selector: 'img',
  property: 'src',
  if_null: 'img/default_album.png'
}];

var song_map = [
{
  name: 'id',
  attribute: 'data-id'
},
{
  name: 'title',
  selector: 'td[data-col="title"] span',
  property: 'innerText',
  if_null: ''
},
{
  name: 'artist',
  selector: 'td[data-col="artist"] span a',
  property: 'innerText',
  if_null: ''
},
{
  name: 'album',
  selector: 'td[data-col="album"] span a',
  property: 'innerText',
  if_null: ''
},
{
  name: 'total_time',
  selector: 'td[data-col="duration"] span',
  property: 'innerText',
  if_null: '0:00'
},
{
  name: 'album_art',
  selector: 'td[data-col="title"] span img',
  property: 'src',
  if_null: 'img/default_album.png'
}];
