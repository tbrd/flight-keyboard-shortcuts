
/**
 * # flight-keyboard-shortcuts
 *
 * handles key press events, combos & sequences
 * =====================
 * ## Options
 *
 * ### shortcuts
 *
 * {
 *   esc: [
 *     {
 *       eventName: 'close-dialog'
 *     },
 *     {
 *       eventName: 'unfocus',
 *       selector: 'textarea, input'
 *     }
 *   ],
 *   c: [
 *     {
 *       eventName: 'compose-tweet'
 *     }
 *   ],
 *   'CTRL+ret': [
 *     {
 *       eventName: 'send-tweet'
 *       throttle: true
 *     }
 *   ]
 * }
 *
 *
 * ## Events
 *
 * ### shortcut-add
 * ---------------------
 * Options
 * shortcut     required    String    a key, combo string or key sequence
 * eventName    required    String    event to fire when key is pressed
 * selector     optional    String    CSS selector
 * ---------------------
 * #### single key:
 *
 * this.trigger('shortcut-add', {
 *   shortcut: 'c',
 *   eventName: 'compose-tweet'
 * });
 *
 * #### throttled (100ms):
 *
 * this.trigger('shortcut-add', {
 *   shortcut: 'c',
 *   eventName: 'compose-tweet',
 *   throttle: true
 * });
 *
 * #### named key:
 *
 * this.trigger('shortcut-add', {
 *   shortcut: 'esc',
 *   eventName: 'close-dialog'
 * });
 *
 * #### sequence:
 *
 * this.trigger('shortcut-add', {
 *   shortcut: 'g i',
 *   eventName: 'go-inbox'
 * });
 *
 * #### combo:
 *
 * this.trigger('shortcut-add', {
 *   shortcut: 'CTRL+ret',
 *   eventName: 'send-tweet'
 * });
 *
 * Text inputs (input, textarea) are ignored by default. if you want to listen to events on input
 * elements, add a selector as a third parameter:
 *
 * this.trigger('shortcut-add', {
 *   shortcut: 'esc',
 *   eventName: 'unfocus',
 *   selector: 'textarea, input'
 * });
 *
 * =====================
 * ## shortcut-remove
 * ---------------------
 * params
 * shortcut     Required    String      A key, combo string or key sequence
 * eventName    Optional    String      Event name
 * selector     Optional    String      CSS selector
 * ---------------------
 * ### usage
 *
 * #### remove all shortcuts for a key
 *
 * this.trigger('shortcut-remove', {
 *   shortcut: 'esc'
 * });
 */

define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');

  /**
   * Module exports
   */

  return defineComponent(keyboardShortcuts);

  /**
   * Module function
   */

  function keyboardShortcuts () {

    this.defaultAttrs({
      debounce: 200,
      throttle: 100,
      shortcuts: null,
      charCodes: {
        esc: 27,
        ret: 13,
        del: 46,
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        bksp: 8,
        pageup: 33,
        pagedown: 34,
        home: 36,
        end: 35
      },
      defaultKeyEvent: 'keypress',
      keySequenceTimeoutDelay: 1000,
      modifiers: {
        ctrl: 'ctrlKey',
        alt: 'altKey',
        cmd: 'metaKey',
        shift: 'shiftKey'
      }
    });

    this.after('initialize', function () {

      this.activeSequences = {};
      this.sequenceStarters = {};
      this.singleKeys = {};
      this.combos = {};

      // register shortcuts
      for (var key in this.attr.shortcuts) {
        if (this.attr.shortcuts.hasOwnProperty(key)) {
          var shortcut = this.attr.shortcuts[key];
          if (typeof shortcut == 'string') {
            //shorthand sugar - shortcut is event name only
            this.addShortcut(key, this.shortcutEventHandlerFactory({event: shortcut}));
          } else {
            shortcut.forEach(function(shortcut) {
              // create a new callback for each shortcut to ensure with_key_handler
              // recognises it as unique.
              var callback = this.shortcutEventHandlerFactory({
                event: shortcut.eventName,
                throttle: shortcut.throttle
              });
              this.addShortcut(key, callback, shortcut.selector);
            }, this);
          }
        }
      }

      // listen for key events on the window
      this.on(window, 'keypress', this.handleKeyPress);
      this.on(window, 'keydown', this.handleKeyDown);

      // listen for shortcut events
      this.on('shortcut-add', this.handleShortcutAdd);
      this.on('shortcut-remove', this.handleShortcutRemove);
    });

    this.handleShortcutAdd = function (e, data) {
      var callback = this.shortcutEventHandlerFactory({
        event: data.eventName,
        throttle: data.throttle
      });
      this.addShortcut(data.shortcut, callback, data.selector)
    };

    this.handleShortcutRemove = function (e, data) {
      this.removeShortcut(data.shortcut, data.eventName, data.selector);
    };

    /**
     * get a matching shortcut for a keyboard event
     * @param e
     * @return {*}
     */
    this.getShortcutForEvent = function (e) {
      var charCode = e.which;
      var shortcut;

      if (this.eventHasModifier(e)) {
        shortcut = this.combos[charCode];
      }

      if (!shortcut && !this.eventHasFunctionModifier(e)) {
        // No combo defined for the given combination, fall back to
        // single key shortcut instead.
        // N.b. Function modifiers only apply to combo shortcuts. Do not fall back.
        shortcut = this.activeSequences[charCode] ||
          this.singleKeys[charCode] ||
          this.sequenceStarters[charCode];
      }

      return shortcut;
    };

    /**
     * delete any active sequence end shortcuts
     */
    this.clearActiveSequences = function () {
      this.activeSequences = {};
    };

    /**
     * Return true if ctrl, alt, cmd or shift is currently pressed
     * @param e
     * @return {*}
     */
    this.eventHasModifier = function (e) {
      return e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;
    };

    /**
     * Return true if a function/command modifier is pressed
     */
    this.eventHasFunctionModifier = function (e) {
      return e.ctrlKey || e.metaKey;
    };

    /**
     * Return true if a text modifier is pressed. These can be used in combo
     * shortcuts (e.g. shift+space), but will generally be used to access single
     * key events (on a US keyboard '?' is accessed by pressing shift+'/' ).
     */
    this.eventHasTextModifier = function (e) {
      return e.altKey || e.shiftKey;
    };

    /**
     * Return a shortcut if the a keyEvent modifier matches the event modifier
     * Return undefined if there is no modifier key on this event
     * Return undefined if there is no matching shortcut
     * @param e
     * @param keyEvent
     * @return {*}
     */
    this.getModifiedKeyEvent = function (e, keyEvent) {

      var modifiedKeyEvent;

      if (this.eventHasModifier(e)) {
        // if modifier key is required, keyEvent should have correct modifier
        if (keyEvent.modifiers) {
          for (var key in keyEvent.modifiers) {
            if (keyEvent.modifiers.hasOwnProperty(key)) {
              if (e[key]) {
                modifiedKeyEvent = keyEvent.modifiers[key];
              }
            }
          }
        }
      }

      return modifiedKeyEvent;
    };

    /**
     * Handle a keypress event. If the key matches any registered shortcuts,
     * call the callback method for that shortcut.
     * @param e
     */
    this.handleKeyPress = function (e) {

      var shortcut;
      var shortcuts = [];
      var defaultSelector = ':not(input):not(textarea)';

      // normalize to lower case
      if (e.which >= 65 && e.which <= 90) {
        e.which += 32;
      }

      shortcut = this.getShortcutForEvent(e);

      if (!shortcut) {
        // if there's no matching shortcut, clear the active sequences
        this.clearActiveSequences();
      } else {
        // if this is a sequence starter
        if (shortcut.sequences) {

          // register all the sequence end shortcuts
          for (var key in shortcut.sequences) {
            if (shortcut.sequences.hasOwnProperty(key)) {
              this.addSequenceEnd(key, shortcut.sequences[key]);
            }
          }

          // cancel all sequence end shortcuts if no key is pressed
          setTimeout(function () {
            this.clearActiveSequences();
          }.bind(this), this.attr.keySequenceTimeoutDelay);

        } else {

          shortcuts = shortcut.shortcuts || [shortcut];

          // if this is a combo, get the corresponding shortcut
          shortcuts = shortcuts.map(function (shortcut) {
            if (shortcut.modifiers) {
              shortcut = this.getModifiedKeyEvent(e, shortcut);
            }
            return shortcut;
          }, this);

          // shortcuts will be undefined if modifier keys did not match
          shortcuts = shortcuts.filter(function (shortcut) {
            return shortcut !== undefined;
          });

          shortcuts.forEach(function (shortcut) {
            // check the target matches our selector
            var selector = shortcut.selector || defaultSelector;
            if ($(e.target).is(selector)) {
              // finally, fire the callback!
              shortcut.callback(e, shortcut.data);
            }
          });

          // pressing any key that isn't a sequence starter should clear all
          // active key sequences.
          this.clearActiveSequences();
        }
      }
    };

    /**
     * Return the ascii char code for a char or special key (del, ret, esc)
     * @param key {String}
     * @return {Number}
     */
    this.getCharCodeForKey = function (key) {

      var charCode;
      var validKey = false;
      var acceptedKeyCodeRanges = [
        [32, 64],
        [91, 126]
      ];

      if (typeof key !== 'string') {
        throw 'Key must be a string';
      }

      key = key.toLowerCase();

      if (key.length === 1) {
        // single character
        charCode = key.charCodeAt(0);
        acceptedKeyCodeRanges.forEach(function (range) {
          if (charCode >= range[0] && charCode <= range[1]) {
            validKey = true;
            return false;
          }
        });
        if (!validKey) {
          charCode = undefined;
        }
      } else {
        // special keys
        charCode = this.attr.charCodes[key];
      }

      return charCode;
    };

    /**
     * Register a single key shortcut
     * @param key {String}
     * @param callback {Function}
     * @param selector {String} Optional
     */
    this.addSingleKey = function (key, callback, selector, data) {

      var charCode;

      if (typeof callback !== 'function') {
        throw 'addSingleKey: no callback';
      }

      charCode = this.getCharCodeForKey(key);

      if (charCode === undefined) {
        throw 'addSingleKey: invalid key string';
      } else {
        // we have a valid key. add it to the list!
        if (this.singleKeys[charCode]) {

          var isUnique = this.singleKeys[charCode].shortcuts
            .every(function (shortcut) {
              return callback !== shortcut.callback ||
                selector !== shortcut.selector;
            }, this);

          if (!isUnique) {
            throw 'addSingleKey: attempted to add identical shortcut';
          }

        } else {
          // create a new handler
          this.singleKeys[charCode] = {
            shortcuts: []
          };
        }

        this.singleKeys[charCode].shortcuts.push({
          shortcut: key,
          callback: callback,
          selector: selector,
          data: data
        });
      }
    };

    /**
     * Register a sequence shortcut
     * @param sequence {String}
     * @param callback {Function}
     * @param selector {String} Optional
     */
    this.addSequence = function (sequence, callback, selector, data) {

      var keys;
      var startKey;
      var endKey;

      if (typeof callback !== 'function') {
        throw 'addSequence: no callback';
      }

      if (typeof sequence !== 'string') {
        throw 'addSequence: sequence must be a string';
      }

      keys = sequence.split(' ');

      if (keys.length !== 2) {
        throw 'addSequence: sequence should be in format "g a"';
      }

      startKey = this.getCharCodeForKey(keys[0]);
      if (startKey === undefined) {
        throw 'addSequence: sequence should be in format "g a"';
      }

      endKey = this.getCharCodeForKey(keys[1]);
      if (endKey === undefined) {
        throw 'addSequence: sequence should be in format "g a"';
      }

      if (!this.sequenceStarters[startKey]) {
        // register a new sequence starter
        this.sequenceStarters[startKey] = {
          sequences: {}
        };
      }

      // add a sequence end shortcut to the sequence
      this.sequenceStarters[startKey].sequences[keys[1]] = {
        shortcut: sequence,
        callback: callback,
        selector: selector,
        data: data
      };
    };

    /**
     * Register a sequence end shortcut
     * @param key {String}
     * @param sequence {Object}
     */
    this.addSequenceEnd = function (key, sequence) {

      var charCode;

      if (typeof sequence.callback !== 'function') {
        throw 'addSequenceEnd: no callback';
      }
      if (typeof key !== 'string') {
        throw 'addSequenceEnd: invalid shortcut key';
      }

      charCode = this.getCharCodeForKey(key);

      if (charCode === undefined) {
        throw 'addSequenceEnd: invalid shortcut key';
      }

      // register an active sequence
      this.activeSequences[charCode] = {
        shortcut: sequence.shortcut,
        callback: sequence.callback,
        selector: sequence.selector,
        data: sequence.data
      };
    };

    /**
     * Register a combo shortcut
     * @param combo {String}
     * @param callback {Function}
     * @param selector {String} Optional
     */
    this.addCombo = function (combo, callback, selector, data) {

      var keys;
      var modifier;
      var charCode;

      if (typeof callback !== 'function') {
        throw 'addCombo: no callback';
      }

      if (typeof combo !== 'string') {
        throw 'addCombo: invalid combo string';
      }

      keys = combo.split('+');

      if (keys.length !== 2) {
        throw 'addCombo: invalid combo';
      }

      modifier = this.attr.modifiers[keys[0].toLowerCase()];

      if (modifier === undefined) {
        throw 'addCombo: invalid modifier';
      }

      charCode = this.getCharCodeForKey(keys[1]);

      if (charCode === undefined) {
        throw 'addCombo: invalid shortcut key';
      }

      var shortcut = {
        modifiers: {}
      };

      // add a modifier to the combo
      shortcut.modifiers[modifier] = {
        shortcut: combo,
        callback: callback,
        selector: selector,
        data: data
      };

      if (!this.combos[charCode]) {
        this.combos[charCode] = {
          shortcuts: []
        };
      }

      this.combos[charCode].shortcuts.push(shortcut);

    };

    /**
     * Check if shortcut is a sequence (eg 'g a'
     * @param shortcut {String}
     * @return {Boolean}
     */
    this.isSequence = function (shortcut) {
      return typeof shortcut === 'string' && shortcut.indexOf(' ') > 0;
    };

    /**
     * Check if shortcut is a combo (eg 'CTRL+a')
     * @param shortcut {String}
     * @return {Boolean}
     */
    this.isCombo = function (shortcut) {
      return typeof shortcut === 'string' && shortcut.indexOf('+') > 0;
    };

    /**
     * Register a shortcut (single key, combo, sequence)
     * @param shortcut {String}
     * @param callback {Function}
     * @param selector {String} optional
     */
    this.addShortcut = function (shortcut, callback, selector, data) {

      if (arguments.length === 3 && typeof selector !== 'string') {
        data = selector;
        selector = undefined;
      }

      if (this.isCombo(shortcut)) {
        this.addCombo(shortcut, callback, selector, data);
      } else if (this.isSequence(shortcut)) {
        this.addSequence(shortcut, callback, selector, data);
      } else {
        this.addSingleKey(shortcut, callback, selector, data);
      }
    };

    /**
     * remove a single key
     * @param key {String}
     */
    this.removeSingleKey = function (key) {
      var charCode = this.getCharCodeForKey(key);
      if (this.singleKeys[charCode]) {
        delete this.singleKeys[charCode];
      }
    };

    /**
     * remove a combo
     * @param combo {String}
     */
    this.removeCombo = function (combo) {
      var charCode = this.getCharCodeForKey(combo.split('+')[1]);
      if (this.combos[charCode]) {
        delete this.combos[charCode];
      }
    };

    /**
     * remove a sequence
     * @param sequence {String}
     */
    this.removeSequence = function (sequence, eventName, selector) {
      var charCode = this.getCharCodeForKey(sequence.split(' ')[0]);
      if (this.sequenceStarters[charCode]) {
        // TODO delete for specific eventName & selector
        delete this.sequenceStarters[charCode];
      }
    };

    /**
     * remove a key, sequence or combo
     * @param shortcut {String}
     */
    this.removeShortcut = function (shortcut, eventName, selector) {
      if (this.isCombo(shortcut)) {
        this.removeCombo(shortcut, eventName, selector);
      } else if (this.isSequence(shortcut)) {
        this.removeSequence(shortcut, eventName, selector);
      } else {
        this.removeSingleKey(shortcut, eventName, selector);
      }
    };

    /**
     * Some keys fire a keydown event rather than keypress
     * @param e
     */
    this.handleKeyDown = function (e) {
      var keydownKeyCodes = [
        this.attr.charCodes.del,
        this.attr.charCodes.bksp,
        this.attr.charCodes.esc,
        this.attr.charCodes.ret,
        this.attr.charCodes.left,
        this.attr.charCodes.right,
        this.attr.charCodes.up,
        this.attr.charCodes.down,
        this.attr.charCodes.pagedown,
        this.attr.charCodes.pageup,
        this.attr.charCodes.home,
        this.attr.charCodes.end
      ];
      var shouldHandle = keydownKeyCodes.some(function (code) {
        return code === e.which;
      });

      if (shouldHandle) {
        this.handleKeyPress(e);
      }
      // otherwise ignore
    };

    this.throttle = function (fn, ms) {
      var lastCalled = null;
      return function (e) {
        var now = Date.now();
        if (!lastCalled || now > lastCalled + ms) {
          fn(e);
          lastCalled = now;
        }
      }
    };

    this.debounce = function (fn, ms) {
      var lastCalled = null;
      return function (e) {
        var now = Date.now();

        if (!lastCalled || now > lastCalled + ms) {
          fn(e);
        }

        lastCalled = now;
      }
    };

    /**
     * the shortcut has been triggered, so we should trigger the event for the shortcut
     * @param shortcut {Options}
     * @param shortcut.event {String} event name
     * @param shortcut.throttle {Boolean}
     */
    this.shortcutEventHandlerFactory = function(shortcut) {

      var throttledEventHandler;
      var debouncedEventHandler;
      var throttlePeriod;

      var eventHandler = function(e) {
        e.preventDefault();
        e.stopPropagation();

        this.trigger(e.target, shortcut.event);
      }.bind(this);

      if (shortcut.throttle !== undefined) {
        if (typeof shortcut.throttle === 'number') {
          throttlePeriod = shortcut.throttle;
        } else {
          throttlePeriod = this.attr.throttle;
        }
        throttledEventHandler = this.throttle(eventHandler, throttlePeriod);
        return throttledEventHandler;
      } else {
        debouncedEventHandler = this.debounce(eventHandler, this.attr.debounce);
        return debouncedEventHandler;
      }
    };
  }

});
