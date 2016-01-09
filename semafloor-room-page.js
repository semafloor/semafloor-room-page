
var _alphaFloors = [
  'level 1','level 2','level 3','level 3A','level 5','level 6',
  'level 7','level 8','level 9','level 10','level 11','level 12'];
var _alphaFloorsCode = [
  '01level','02level','03level','04level','05level','06level',
  '07level','08level','09level','10level','11level','12level'];
var _siteNames = ['KLB - Tower 5', 'KLB - Tower 2A', 'SUITE'];
var _roomTypes = [
  'Adjoining Room (Operable Wall)','Panaboard','Polycom CX100 (Audio)',
  'Polycom CX5000 (Video Conferencing)','Projector','Projector Cable Faulty',
  'Projector Faulty','Screen Projector Faulty','SmartBoard 800','Telepresence',
  'TV','Writing Glass Board'];

Polymer({

  is: 'semafloor-room-page',

  properties: {
    url: {
      type: String,
      value: 'https://semafloor-webapp.firebaseio.com/json/room-info'
    },

    _allSiteCards: {
      type: Array,
      value: function() {
        return _siteNames;
      }
    },
    _enteredSite: {
      type: String,
      value: 'FERN'
    },
    _enteredFloor: {
      type: String,
      value: 'Level 13'
    },
    _roomInfo: {
      type: Array,
      value: function() {
        return [];
      }
    },
    _roomsAtEnteredFloor: {
      type: Array,
      value: function() {
        return [];
      }
    },
    _infoAtEnteredRoom: {
      type: Array,
      value: function() {
        return [];
      }
    },
    _isDataReady: {
      type: Boolean,
      value: false
    },
    _roomNotReady: {
      type: Boolean,
      value: false
    },

  },

  // Element Lifecycle

  ready: function() {
    // `ready` is called after all elements have been configured, but
    // propagates bottom-up. This element's children are ready, but parents
    // are not.
    //
    // This is the point where you should make modifications to the DOM (when
    // necessary), or kick off any processes the element wants to perform.
  },

  attached: function() {
    // `attached` fires once the element and its parents have been inserted
    // into a document.
    //
    // This is a good place to perform any work related to your element's
    // visual state or active behavior (measuring sizes, beginning animations,
    // loading resources, etc).
    var _width = this.getBoundingClientRect().width;
    // 16:9 aspect ratio for an image to scale and fit properly.
    (this.domHost || Polymer).updateStyles({
       '--iron-image-height': (_width / 16 * 9) + 'px'
     });
  },

  detached: function() {
    // The analog to `attached`, `detached` fires when the element has been
    // removed from a document.
    //
    // Use this to clean up anything you did in `attached`.
  },

  _onFirebaseValue: function(ev) {
  console.log('on-firebase-value');
  // set _currentReservations when data is fetched.
  this.set('_roomInfo', ev.detail.val());
  // if beta || gama is selected...
  if (this._roomNotReady) {
    this._decodeRoom(this._enteredFloor.toLowerCase(), this._enteredSite);
  }
  // unhide iron-list and hide progress bar.
  this.set('_isDataReady', true);
  // update all iron-lists.
  this.$.floorsList.fire('iron-resize');
  this.$.roomsList.fire('iron-resize');

  this.fire('room-info-ready');
},

  _computeSiteIcon: function(_index) {
    return ['language', 'trending-up', 'group-work'][_index];
  },
  _computeSiteImage: function(_index) {
    var _images = [
      'http://www.iphotographies.com/file/133/2560x1440/crop/salar-de-uyuni-after-some-rain.jpg',
      'http://hqworld.net/gallery/data/media/155/camping_under_the_northern_lights__jokulsa_loni__iceland.jpg',
      'http://images.huffingtonpost.com/2014-08-15-dreamstime_xxl_24117047_theBlueHole.jpg',
      'https://hdwallpapers.cat/wallpaper_2560x1440/machu_picchu_peru_at_sunrise_inca_ancient_2560x1440_hd-wallpaper-1776613.jpg',
      'http://static.zerochan.net/5.Centimeters.Per.Second.full.68021.jpg'
    ];
    _images.splice(_index, 1);
    return _.sample(_images);
  },

  _enterSite: function(ev) {
    var _item = ev.model.item;

    if (_item === 'KLB - Tower 5') {
      this.set('_enteredSite', _item);
      this.set('_floorsAtEnteredSite', _alphaFloors);

      this.$.floorDialog.open();
    }else {
      if (_.isEmpty(this._roomInfo) || _.isUndefined(this._roomInfo)) {
        this.set('_roomNotReady', true);
        this.set('_enteredSite', _item);
        this.set('_enteredFloor', _item === 'SUITE' ? 'Level 1' : 'Level 3');
        this.$.roomDialog.open();
      }else {
        this.set('_enteredSite', _item);
        this.set('_enteredFloor', _item === 'SUITE' ? 'Level 1' : 'Level 3');
        this._decodeRoom(_item === 'SUITE' ? 'level 1' : 'level 3', _item);

        this.$.roomDialog.open();
      }
    }
  },
  _leaveFloor: function(ev) {
    // this.set('_enteredSite', null);
    this.$.floorDialog.close();
  },
  _enterRoom: function(ev) {
    this.set('_enteredFloor', ev.model.item);
    this._decodeRoom(ev.model.item, this._enteredSite);

    this.$.roomDialog.open();
  },
  _leaveRoom: function(ev) {
    // this.set('_enteredFloor', null);
    this.$.roomDialog.close();
  },
  _enterInfo: function(ev) {
    this.set('_infoAtEnteredRoom', [ev.model.item]);
    this.$.infoDialog.open();
  },
  _decodeRoom: function(_floor, _site) {
    var _siteCodes = ['alpha', 'beta', 'gamma'];
    var _decodeSite = _siteCodes[_siteNames.indexOf(_site)];
    var _decodeFloor = _alphaFloorsCode[_alphaFloors.indexOf(_floor)];
    this.set('_roomsAtEnteredFloor', this._roomInfo[_decodeSite][_decodeFloor]);
  },
  _onOpened: function() {
    // when overlay opened update overlay backdrop zIndex.
    var _zIndex = parseInt(this.$.roomDialog.style.zIndex) + 1;
    this.$.infoDialog.backdropElement.style.zIndex = _zIndex;
    // update custom paper-checkbox styles.
    (this.domHost || Polymer).updateStyles();
    // to update position of dialog to be centered on screen.
    // async does work.
    this.async(function() {
      this.$.infoDialog.notifyResize();
    });
  },
  _decodeTypes: function(_types) {
     var _hexTypes = _.padLeft(parseInt(_types, 16).toString(2), 12, 0);
     var _str2arr = _hexTypes.split('').map(Number);
     var _filtered = [];
     _.filter(_str2arr, function(el, idx) {
       if (el === 1) _filtered.push(_roomTypes[idx]);
     });
     _hexTypes = null; _str2arr = null;
     return _filtered;
   },
   _computeInfoCls: function(_enteredSite) {
     var _siteIdx = _siteNames.indexOf(_enteredSite);
     var _siteCls = ['language', 'trending-up', 'group-work'][_siteIdx];
     return ' info-title ' + _siteCls;
   },

});
