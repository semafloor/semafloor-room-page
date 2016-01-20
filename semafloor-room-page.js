
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
    _siteReady: {
      type: Boolean,
      value: false
    },
    _rippleToBeCancelled: {
      type: Number,
      value: 3
    },
    _scrolled: {
      type: Boolean,
      value: false
    },
    _prevYPos: {
      type: Number,
      value: -10
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
    this.updateIronImageWidth();
    this.fire('room-page-attached');
  },

  detached: function() {
    // The analog to `attached`, `detached` fires when the element has been
    // removed from a document.
    //
    // Use this to clean up anything you did in `attached`.
  },

  listeners: {
    'touchmove': '_cancelRippleWhileScrolling'
  },

  _onDown: function(ev) {
    // save tapped ripple index and tapped position Y.
    this.set('_rippleToBeCancelled', ev.model.index);
    this.set('_prevYPos', Math.ceil(ev.detail.y));
  },
  _onUp: function(ev) {
    // set _scrolled when first scroll.
    if (this._scrolled) {
      this.set('_scrolled', false);
    }
  },
  _cancelRippleWhileScrolling: function (ev) {
    if (!this._scrolled) {
      // change if y position changes.
      if (this._prevYPos !== ev.changedTouches.screenY) {
        this.set('_scrolled', true);
      }
    }else {
      // cancel ripple effect during scrolling.
      var _ripples = Polymer.dom(this.root).querySelectorAll('paper-ripple');
      _ripples[this._rippleToBeCancelled].upAction();
    }
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
        'https://c4.staticflickr.com/8/7209/6891647325_29b124ebe4_b.jpg',
        'https://wallpaperscraft.com/image/dubai_uae_buildings_skyscrapers_night_96720_2560x1440.jpg',
        'https://wallpaperscraft.com/image/kln_germany_bridge_weser_reflection_architecture_hdr_47748_2560x1440.jpg',
        'https://wallpaperscraft.com/image/twin_towers_new_york_world_trade_center_skyscrapers_river_bridge_night_city_manhattan_59434_1920x1080.jpg'
    ];
    _images.splice(_index, 1);
    return _.sample(_images);
  },

  _setSiteReady: function(ev) {
    if (!this._setReady) {
      // set _setSiteReady when tap.
      this.set('_siteReady', true);
    }
  },
  _enterSite: function(ev) {
    // do nothing when no tap or scrolled.
    if (!this._siteReady || this._scrolled) {
      return;
    }

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
    // reset _siteReady to norm before tap.
    this.set('_siteReady', false);
    // async-ly updateStyles of each paper-checkboxes if any.
    this.async(function() {
      var _checkboxes = Polymer.dom(this.$.infoDialog).querySelectorAll('paper-checkbox');
      if (_checkboxes.length !== 0) {
        for (var i = 0; i < _checkboxes.length; i++) {
          _checkboxes[i].updateStyles();
        }
      }
    });
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
    // workaround to show backdrop inside nested dialogs then
    // notifyResize dialog async-ly.
    this.async(function() {
      var _zIndex = parseInt(this.$.roomDialog.style.zIndex) + 1;
      this.$.infoDialog.backdropElement.style.zIndex = _zIndex;
      this.$.infoDialog.notifyResize();
    });
  },
  _decodeRoom: function(_floor, _site) {
    var _siteCodes = ['alpha', 'beta', 'gamma'];
    var _decodeSite = _siteCodes[_siteNames.indexOf(_site)];
    var _decodeFloor = _alphaFloorsCode[_alphaFloors.indexOf(_floor)];
    this.set('_roomsAtEnteredFloor', this._roomInfo[_decodeSite][_decodeFloor]);
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
   _isRestricted: function(_access) {
     return _access ? 'No' : 'Yes';
   },

   // updateIronImageWidth
   updateIronImageWidth: function() {
     var _width = this.getBoundingClientRect().width;
     // 16:9 aspect ratio for an image to scale and fit properly.
     this.updateStyles({
        '--iron-image-height': (_width / 16 * 9) + 'px'
      });
   },

});
