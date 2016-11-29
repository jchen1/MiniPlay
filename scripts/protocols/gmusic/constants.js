const artistMap = [
  {
    name: 'heading',
    selector: 'a',
    property: 'innerText',
    default: ''
  },
  {
    name: 'id',
    attribute: 'data-id'
  },
  {
    name: 'image',
    selector: 'img',
    property: 'src',
    default: 'img/default_artist.png'
  }];

const albumMap = [
  {
    name: 'heading',
    selector: '.title',
    property: 'innerText',
    default: ''
  },
  {
    name: 'subheading',
    selector: '.sub-title',
    property: 'innerText',
    default: ''
  },
  {
    name: 'id',
    attribute: 'data-id'
  },
  {
    name: 'image',
    selector: 'img',
    property: 'src',
    default: 'img/default_album.png'
  }];

const stationMap = [
  {
    name: 'id',
    attribute: 'data-id'
  },
  {
    name: 'heading',
    selector: '.title',
    property: 'innerText',
    default: ''
  },
  {
    name: 'image',
    selector: 'img',
    property: 'src',
    default: 'img/default_album.png'
  }];

const recentMap = [
  {
    name: 'id',
    attribute: 'data-id'
  },
  {
    name: 'heading',
    selector: '#details a.card-title',
    property: 'innerText',
    default: ''
  },
  {
    name: 'subheading',
    selector: '#details a.card-subtitle',
    property: 'innerText',
    default: ''
  },
  {
    name: 'style',
    default: 'circle'
  },
  {
    name: 'image',
    selector: 'img',
    property: 'src',
    default: 'img/default_album.png'
  }];

const playlistMap = [
  {
    name: 'id',
    attribute: 'data-id'
  },
  {
    name: 'heading',
    selector: '.title',
    property: 'innerText',
    default: ''
  },
  {
    name: 'style',
    default: 'circle'
  },
  {
    name: 'image',
    selector: 'img',
    property: 'src',
    default: 'img/default_album.png'
  }];

const songMap = [
  {
    name: 'id',
    attribute: 'data-id'
  },
  {
    name: 'title',
    selector: 'td[data-col="title"] span',
    property: 'innerText',
    default: ''
  },
  {
    name: 'artist',
    selector: 'td[data-col="artist"] span a',
    property: 'innerText',
    default: ''
  },
  {
    name: 'album',
    selector: 'td[data-col="album"] span a',
    property: 'innerText',
    default: ''
  },
  {
    name: 'total_time',
    selector: 'td[data-col="duration"] span',
    property: 'innerText',
    default: '0:00'
  },
  {
    name: 'album_art',
    selector: 'td[data-col="title"] span img',
    property: 'src',
    default: 'img/default_album.png'
  }];
