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

  behaviors: [
    Polymer.NeonSharedElementAnimatableBehavior,
    Polymer.NeonAnimationRunnerBehavior
  ],

  properties: {
    url: {
      type: String,
      // TODO: To change to new Firebase reference URL soon.
      value: 'https://polymer-semaphore.firebaseio.com/mockMessages/2016/01february/week07/17/site'
    },

    animationConfig: {
      type: Object,
      value: function() {
        return {
          'entry': [{
            name: 'cascaded-animation',
            animation: 'slide-from-bottom-animation',
            timing: {
              delay: 550
            }
          }],
          'dialogEntry': [{
            name: 'cascaded-animation',
            animation: 'slide-from-bottom-animation',
            timing: {
              delay: 550
            }
          }]
        };
      }
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

    imagesList: {
      type: Array,
      value: function() {
        var _images = [
          'https://c4.staticflickr.com/8/7209/6891647325_29b124ebe4_b.jpg',
          'https://wallpaperscraft.com/image/dubai_uae_buildings_skyscrapers_night_96720_2560x1440.jpg',
          'https://wallpaperscraft.com/image/kln_germany_bridge_weser_reflection_architecture_hdr_47748_2560x1440.jpg',
          'https://wallpaperscraft.com/image/twin_towers_new_york_world_trade_center_skyscrapers_river_bridge_night_city_manhattan_59434_1920x1080.jpg',
          'https://wallpaperscraft.com/image/skyscrapers_city_night_lights_91888_1920x1080.jpg',
          'https://wallpaperscraft.com/image/london_england_city_night_lights_river_thames_uk_tower_bridge_lantern_58386_1920x1080.jpg',
          'https://wallpaperscraft.com/image/tokyo_japan_city_night_lights_63139_1920x1080.jpg'
        ];
        return _images;
      }
    },

    _isLoadingCard: {
      type: Boolean,
      value: true
    },
    _page: {
      type: String,
      value: 'loading'
    },
    _exploringSiteIdx: Number,
    _floorInfoTitle: String,


  },

  observers: [
    '_applyAnimationConfigToNodes(_isDataReady)'
  ],

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
    // this.updateIronImageWidth();
    // var _cardsList = Polymer.dom(this.root).querySelectorAll('paper-card');
    // this.animationConfig['entry'][0].nodes = _cardsList;

    this.async(function() {
      this.fire('room-page-attached');
    });
  },

  detached: function() {
    // The analog to `attached`, `detached` fires when the element has been
    // removed from a document.
    //
    // Use this to clean up anything you did in `attached`.
  },

  listeners: {
    'touchmove': '_cancelRippleWhileScrolling'
    // 'neon-animation-finish': '_cardAnimationDone'
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
    console.log('on-firebase-value', ev.detail.val());
    // set _currentReservations when data is fetched.
    this.set('_roomInfo', ev.detail.val());
    // if beta || gama is selected...
    if (this._roomNotReady) {
      this._decodeRoom(this._enteredFloor.toLowerCase(), this._enteredSite);
    }
    // unhide iron-list and hide progress bar.
    this.set('_isDataReady', true);
    // update all iron-lists.
    // this.$.floorsList.fire('iron-resize');
    // this.$.roomsList.fire('iron-resize');

    this.fire('room-info-ready');
  },

  _computeSiteIcon: function(_index) {
    return ['language', 'trending-up', 'group-work'][_index];
  },
  _computeSiteImage: function(_imagesList) {
    // To randomize the imagesList and splice the randomize index from the imagesList.
    // To ensure site image will always be different through randomization.
    var _randomIdx = _.random(0, _imagesList.length - 1);
    var _removed = this.splice('imagesList', _randomIdx, 1);
    return _removed;
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

  // updateIronImageWidth.
  // updateIronImageWidth: function(_width) {
  //   // 16:9 aspect ratio for an image to scale and fit properly.
  //   this.updateStyles({
  //     '--iron-image-height': (_width / 16 * 9) + 'px'
  //   });
  // },

  // Re-randomize thumbnail of selected paper-card.
  _rollThumbnail: function(ev) {
    var _rollIdx = ev.model.index;
    var _ironImages = Polymer.dom(this.root).querySelectorAll('iron-image');
    var _currentThumbnail = _ironImages[_rollIdx].src;

    this.push('imagesList', _currentThumbnail[0]);
    _ironImages[_rollIdx].src = this._computeSiteImage(this.imagesList);
  },
  _exploreSite: function(ev) {
    this.debounce('rippleEnd', function() {
      var _exploreItem = ev.model.item;
      var _siteIdx = _siteNames.indexOf(_exploreItem);
      var _siteCode = ['alpha', 'beta', 'gamma'][_siteIdx];
      var _floors = _alphaFloors;

      if (_siteCode === 'beta') {
        _floors = ['level 3'];
      }else if (_siteCode === 'gamma') {
        _floors = ['level 1'];
      }

      // this.set('_allSiteCards', _floors);
      this.set('_floorInfoTitle', this._idxToName(_siteIdx));
      this.set('_allFloorCards', _floors);
      this.set('_exploringSiteIdx', _siteIdx);
      // this.playAnimation('entry');
      this.async(function() {
        this.$.floorInfo.open();

        // _setAnimationConfigToCards here with opening dialog.
        // _setAnimationConfigToCards when overlay is opened is way too slow in running the animation.
        this._setAnimationConfigToCards(this.$.floorInfo, 'dialogEntry', null);
      }, 350);

      // console.log(_siteCode, _floors, this._roomInfo);
    }, 1);
  },
  _exploreFloor: function(ev) {
    console.log(ev, this._floorInfoTitle);
    // If at floor level...
    var _item = ev.model.item;

    if (this._floorInfoTitle.indexOf('level') >= 0) {
      //TODO: After clicking on a room, what to do with _exploreFloor function?
      var _roomInfo = this._allRoomsCards['item'];
      this.set('_allFloorCards', [_roomInfo]);
    }else {
      // if at room level...
      // var _floorItem = ev.model.item;
      var _floorIdx = _alphaFloors.indexOf(_item);
      var _floorCode = _alphaFloorsCode[_floorIdx];
      var _roomInfo = this._roomInfo;
      var _exploringSiteIdx = ev.model._exploringSiteIdx;
      var _siteCode = ['alpha', 'beta', 'gamma'][_exploringSiteIdx];
      var _rooms = _roomInfo[_siteCode][_floorCode];

      console.log(_rooms, _siteCode, _floorCode);
      this.set('_allRoomsCards', [_rooms, _item]);
      this.set('_allFloorCards', _.keys(_rooms));
    }

    this.set('_floorInfoTitle', _item);

    this.async(function() {
      this._setAnimationConfigToCards(this.$.floorInfo, 'dialogEntry', null);
    }, 1);

    // this.playCardAnimation('dialogEntry', null);
  },

  _setAnimationConfigToCards: function(_node, _animationName, _page) {
    var _cardsList = Polymer.dom(_node).querySelectorAll('paper-card');
    this.animationConfig[_animationName][0].nodes = _cardsList;

    this.playCardAnimation(_animationName, _page);
  },
  _applyAnimationConfigToNodes: function(_isDataReady) {
    if (_isDataReady) {
      this.async(function() {
        this._setAnimationConfigToCards(this.$.pages, 'entry', 'card');
      }, 1);

      // Play the card animation after all paper-card has received the animationConfig;
      // this.playCardAnimation('entry', 'card');
    }
  },
  playCardAnimation: function(_animationName, _page) {
    // play card animation and set the iron-pages from loading to card.
    this.cancelAnimation();
    this.playAnimation(_animationName);

    if (!!_page) {
      this.set('_page', _page);
    }
  },

  _floorInfoDialogOpened: function(ev) {
    document.body.style.overflow = 'hidden';

    // var _floorCards = Polymer.dom(this.$.floorInfo).querySelectorAll('paper-card');
    // this.animationConfig['dialogEntry'][0].nodes = _floorCards;
    // this.async(function() {
    //   this._setAnimationConfigToCards(this.$.floorInfo, 'dialogEntry', null);
    // }, 1);
  },
  _resetDocumentScrolling: function() {
    document.body.style.overflow = '';
  },

  _idxToName: function(_exploringSiteIdx) {
    return ['KLB - Tower 5', 'KLB - Tower 2A', 'SUITE'][_exploringSiteIdx];
  },

  _computeFloorInfoIcon: function(_floorInfoTitle) {
    console.log(_floorInfoTitle);
    if (_floorInfoTitle.indexOf('KLB') >= 0 || _floorInfoTitle.indexOf('SUITE') >= 0) {
      return 'close';
    }
    return 'arrow-back';
  },
  _floorInfoIconAction: function(ev) {
    if (!this.$.floorInfo.opened) {
      return;
    }

    var _target = ev.target;

    while (_target && _target.tagName !== 'PAPER-ICON-BUTTON') {
      _target = _target.parentElement;
    }

    if (_target) {
      console.log(_target);
      var _icon = _target.icon;

      if (_icon.indexOf('close') >= 0) {
        console.log('close');
        this.$.floorInfo.close();
      }else {
        var _items = _alphaFloors;
        var _title = 'KLB - Tower 5';

        // At floor level...
        if (this._floorInfoTitle.indexOf('level') >= 0) {
          console.log(ev, this._exploringSiteIdx);
          var _exploreSiteIdx = this._exploringSiteIdx;

          if (_exploreSiteIdx > 0) {
            _title = 'KLB - Tower 2A';
            _items = ['level 3'];
          }else if (_exploreSiteIdx > 1) {
            _title = 'SUITE';
            _items = ['level 1'];
          }
        }else {
          // At room level...
          // var _roomInfo = this._roomInfo;
          // var _floorCode = this._allRoomsCards[1];
          // var _siteIdx = this._exploringSiteIdx;
          // var _siteCode = ['alpha', 'beta', 'gamma'][_siteIdx];
          // var _floors = this._roomInfo[_siteCode][_floorCode];
          var _allRoomsCards = this._allRoomsCards;
          _items = _.keys(_allRoomsCards[0]);
          _title = _allRoomsCards[1];

          console.log(ev, this._allRoomsCards);
        }

        this.set('_floorInfoTitle', _title);
        this.set('_allFloorCards', _items);

        // The dom-repeat maynot be fast enough to update new cards.
        // Hence from room to floor, only the first card has animation configured.
        this.async(function() {
          this._setAnimationConfigToCards(this.$.floorInfo, 'dialogEntry', null);
          // var _cardsList = Polymer.dom(this.$.floorInfo).querySelectorAll('paper-card');
          // this.animationConfig['dialogEntry'][0].nodes = _cardsList;
          //
          // this.playCardAnimation('dialogEntry', null);
        }, 1);

      }
    }
  },

});
