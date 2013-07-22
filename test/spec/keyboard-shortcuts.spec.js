'use strict';

describeComponent('lib/keyboard-shortcuts', function () {

  beforeEach(function () {
    setupComponent({
      shortcuts: {}
    });
    this.keydown = jQuery.Event('keydown');
    this.keypress = jQuery.Event('keypress');
    this.keyup = jQuery.Event('keyup');
  });

  /**
   * internal
   */

  describe('getCharCodeForKey', function () {

    beforeEach(function () {
      var component = this.component;
      this.getCharCodeForKeyWrapper = function (key) {
        return function () {
          return component.getCharCodeForKey(key);
        };
      };
    });

    it('should throw an exception in key is not a string', function () {
      expect(this.getCharCodeForKeyWrapper(false)).toThrow();
      expect(this.getCharCodeForKeyWrapper(1)).toThrow();
      expect(this.getCharCodeForKeyWrapper(null)).toThrow();
      expect(this.getCharCodeForKeyWrapper(undefined)).toThrow();
    });

    it('should not throw an exception if key is a string', function () {
      expect(this.getCharCodeForKeyWrapper('a')).not.toThrow();
    });

    describe('should return correct char code for', function () {
      it('single characters', function () {
        expect(this.component.getCharCodeForKey('a')).toBe(97);
        expect(this.component.getCharCodeForKey('1')).toBe(49);
      });
      it('del', function () {
        expect(this.component.getCharCodeForKey('del')).toBe(46);
      });
      it('ret', function () {
        expect(this.component.getCharCodeForKey('ret')).toBe(13);
      });
      it('esc', function () {
        expect(this.component.getCharCodeForKey('esc')).toBe(27);
      });
      it('left', function () {
        expect(this.component.getCharCodeForKey('left')).toBe(37);
      });
      it('up', function () {
        expect(this.component.getCharCodeForKey('up')).toBe(38);
      });
      it('right', function () {
        expect(this.component.getCharCodeForKey('right')).toBe(39);
      });
      it('down', function () {
        expect(this.component.getCharCodeForKey('down')).toBe(40);
      });
      it('bksp', function () {
        expect(this.component.getCharCodeForKey('bksp')).toBe(8);
      });
    });
  });

  describe('addKeyEvent', function () {

    beforeEach(function () {
      var component = this.component;
      this.addKeyEventWrapper = function (key, callback) {
        return function () {
          component.addSingleKey(key, callback);
        };
      };
      this.callback = function () {
      };
    });

    it('should throw an exception if key is not a recognised key', function () {
      expect(this.addKeyEventWrapper('test', this.callback)).toThrow();
    });

    describe('should not throw an exception if:', function () {

      it('key is a single character string', function () {
        expect(this.addKeyEventWrapper('a', this.callback)).not.toThrow();
        expect(this.addKeyEventWrapper('z', this.callback)).not.toThrow();
      });

      it('key is esc', function () {
        expect(this.addKeyEventWrapper('esc', this.callback)).not.toThrow();
      });

      it('key is ret', function () {
        expect(this.addKeyEventWrapper('ret', this.callback)).not.toThrow();
      });

      it('key is del', function () {
        expect(this.addKeyEventWrapper('del', this.callback)).not.toThrow();
      });
    });

    it('should throw an exception if no callback is provided', function () {
      expect(this.addKeyEventWrapper('a')).toThrow();
    });

    it('should add single key events', function () {
      expect(this.component.singleKeys['97']).toBeUndefined();
      this.component.addSingleKey('a', this.callback);
      expect(this.component.singleKeys['97']).not.toBeUndefined();
    });

    describe('should add multiple shortcuts for the same key', function () {

      describe('should throw an exception if the shortcut is identical', function () {

        it('and has no selector', function () {
          var callback = function () {
          };
          var addShortcut1 = function () {
            this.component.addSingleKey('a', callback);
          }.bind(this); // bind to avoid using 'self'

          var addShortcut2 = function () {
            this.component.addSingleKey('a', callback);
          }.bind(this);

          addShortcut1();
          expect(addShortcut2).toThrow();
        });

        it('and has a selector', function () {
          var callback = function () {
          };
          var selector = '.test';
          var addShortcut1 = function () {
            this.component.addSingleKey('a', callback, selector);
          }.bind(this);

          var addShortcut2 = function () {
            this.component.addSingleKey('a', callback, selector);
          }.bind(this);

          addShortcut1();
          expect(addShortcut2).toThrow();
        });
      });

      it('should not throw exception if callback is different', function () {
        var callback1 = function () {
          return 1;
        };
        var callback2 = function () {
          return 2;
        };
        var addShortcut1 = function () {
          this.component.addSingleKey('a', callback1);
        }.bind(this);

        var addShortcut2 = function () {
          this.component.addSingleKey('a', callback2);
        }.bind(this);

        addShortcut1();
        expect(addShortcut2).not.toThrow();
      });

      it('should not throw exception if shortcut is different', function () {
        var callback = function () {
        };
        var selector1 = '.test1';
        var selector2 = '.test2';
        var addShortcut1 = function () {
          this.component.addSingleKey('a', callback, selector1);
        }.bind(this);

        var addShortcut2 = function () {
          this.component.addSingleKey('a', callback, selector2);
        }.bind(this);

        addShortcut1();
        expect(addShortcut2).not.toThrow();
      });
    });
  });

  describe('addSequence', function () {

    beforeEach(function () {
      var component = this.component;
      this.addSequenceWrapper = function (combo, callback) {
        return function () {
          component.addSequence(combo, callback);
        };
      };
      this.callback = function () {
      };
    });

    describe('should throw an exception if', function () {

      it('there is no callback', function () {
        expect(this.addSequenceWrapper('c i')).toThrow();
      });

      it('the combo is not in the correct format', function () {
        expect(this.addSequenceWrapper('ci', this.callback)).toThrow();
      });

      it('either one of the items is not a valid key', function () {
        expect(this.addSequenceWrapper('test i', this.callback)).toThrow();
        expect(this.addSequenceWrapper('i test', this.callback)).toThrow();
      });
    });

    it('should add a sequence starter event', function () {
      expect(this.component.sequenceStarters['97']).toBeUndefined();
      this.component.addSequence('a b', this.callback);
      expect(this.component.sequenceStarters['97']).not.toBeUndefined();
    });
  });

  describe('addSequenceEnd', function () {

    beforeEach(function () {
      var component = this.component;
      this.addSequenceEndWrapper = function (key, sequence) {
        return function () {
          component.addSequenceEnd(key, sequence);
        };
      };
      this.sequence = {
        callback: function () {
        }
      };
    });

    describe('should throw an exception if', function () {

      it('there is no sequence', function () {
        expect(this.addSequenceEndWrapper('c')).toThrow();
      });

      it('there is no callback', function () {
        expect(this.addSequenceEndWrapper('c'), {}).toThrow();
      });

      it('key is not a string', function () {
        expect(this.addSequenceEndWrapper(1, this.sequence)).toThrow();
        expect(this.addSequenceEndWrapper(false, this.sequence)).toThrow();
        expect(this.addSequenceEndWrapper(undefined, this.sequence)).toThrow();
        expect(this.addSequenceEndWrapper([], this.sequence)).toThrow();
        expect(this.addSequenceEndWrapper({}, this.sequence)).toThrow();
      });

      it('key is not valid', function () {
        expect(this.addSequenceEndWrapper('test', this.sequence)).toThrow();
      });
    });

    it('should add a sequence end event', function () {
      expect(this.component.activeSequences['97']).toBeUndefined();
      this.component.addSequenceEnd('a', this.sequence);
      expect(this.component.activeSequences['97']).not.toBeUndefined();
    });
  });

  describe('addCombo', function () {

    beforeEach(function () {
      var component = this.component;
      this.addComboWrapper = function (combo, callback) {
        return function () {
          component.addCombo(combo, callback);
        };
      };
      this.callback = function () {
      };
    });

    describe('should throw an exception if', function () {
      it('there is no callback', function () {
        expect(this.addComboWrapper('CMD+1')).toThrow();
      });

      it('key is not a valid combo', function () {
        expect(this.addComboWrapper(undefined, this.callback)).toThrow();
        expect(this.addComboWrapper(1, this.callback)).toThrow();
        expect(this.addComboWrapper('test', this.callback)).toThrow();
        expect(this.addComboWrapper('CMD', this.callback)).toThrow();
        expect(this.addComboWrapper('a', this.callback)).toThrow();
        expect(this.addComboWrapper('a+i', this.callback)).toThrow();
        expect(this.addComboWrapper('CMD+ALT', this.callback)).toThrow();
      });
    });

    describe('should add combo key events', function () {
      it('for CMD', function () {
        expect(this.component.combos['49']).toBeUndefined();
        this.component.addCombo('CMD+1', this.callback);
        expect(this.component.combos['49']).not.toBeUndefined();
      });
      it('for ALT', function () {
        expect(this.component.combos['97']).toBeUndefined();
        this.component.addCombo('ALT+a', this.callback);
        expect(this.component.combos['97']).not.toBeUndefined();
      });
      it('for CTRL', function () {
        expect(this.component.combos['97']).toBeUndefined();
        this.component.addCombo('CTRL+A', this.callback);
        expect(this.component.combos['97']).not.toBeUndefined();
      });
    });
  });

  describe('addShortcut', function () {
    it('should add single key events', function () {
      this.component.addShortcut('a', function () {
      });
      expect(this.component.singleKeys['97']).not.toBeUndefined();
      this.component.addShortcut('b', function () {
      });
      expect(this.component.singleKeys['98']).not.toBeUndefined();
    });

    it('should add special key events', function () {
      this.component.addShortcut('del', function () {
      });
      expect(this.component.singleKeys['46']).not.toBeUndefined();
      this.component.addShortcut('ret', function () {
      });
      expect(this.component.singleKeys['13']).not.toBeUndefined();
    });

    it('should add sequence key events', function () {
      this.component.addShortcut('a i', function () {
      });
      expect(this.component.sequenceStarters['97']).not.toBeUndefined();

      this.component.addShortcut('c i', function () {
      });
      expect(this.component.sequenceStarters['99']).not.toBeUndefined();
    });
  });

  describe('removeShortcut', function () {
    it('should remove single key events', function () {
      var shortcut = 'a';
      var charCode = 'a'.charCodeAt(0);

      this.component.addShortcut(shortcut, function () {
      });
      expect(this.component.singleKeys[charCode]).not.toBeUndefined();
      this.component.removeShortcut(shortcut);
      expect(this.component.singleKeys[charCode]).toBe(undefined);
    });

    it('should remove named keys', function () {
      var shortcut = 'del';
      var charCode = 46;

      this.component.addShortcut(shortcut, function () {
      });
      expect(this.component.singleKeys[charCode]).not.toBeUndefined();
      this.component.removeShortcut(shortcut);
      expect(this.component.singleKeys[charCode]).toBe(undefined);
    });

    it('should remove combos', function () {
      var shortcut = 'CTRL+a';
      var charCode = 'a'.charCodeAt(0);

      this.component.addShortcut(shortcut, function () {
      });
      expect(this.component.combos[charCode]).not.toBeUndefined();
      this.component.removeShortcut(shortcut);
      expect(this.component.combos[charCode]).toBe(undefined);
    });

    it('should remove sequences', function () {
      var shortcut = 'a g';
      var charCode = 'a'.charCodeAt(0);

      this.component.addShortcut(shortcut, function () {
      });
      expect(this.component.sequenceStarters[charCode]).not.toBeUndefined();
      this.component.removeShortcut(shortcut);
      expect(this.component.sequenceStarters[charCode]).toBe(undefined);
    });
  });

  describe('shortcut-add', function () {
    beforeEach(function () {
      this.spy = spyOnEvent(document, 'test-event');
    });

    it('should add single key', function () {
      this.component.$node.trigger('shortcut-add', {
        shortcut: 'esc',
        eventName: 'test-event'
      });

      this.keydown.which = 27;
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);

    });
  });

  describe('should call callback for named key: ', function () {

    beforeEach(function () {
      var callback = function () {
      };
      this.spy = jasmine.createSpy(callback);
    });

    it('esc', function () {
      this.component.addShortcut('esc', this.spy);
      this.keydown.which = 27;
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);
    });

    it('ret', function () {
      this.component.addShortcut('ret', this.spy);
      this.keypress.which = 13;
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

    it('del', function () {
      this.component.addShortcut('del', this.spy);
      this.keypress.which = 46;
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

    it('and only for named key', function () {
      this.component.addShortcut('ret', this.spy);
      this.keypress.which = 13;
      this.component.$node.trigger(this.keypress);
      this.keydown.which = 27;
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);
    });

    it('and perform multiple callbacks for shortcuts with same key', function () {
      var spy1 = jasmine.createSpy('spy1');
      var spy2 = jasmine.createSpy('spy2');

      this.component.addShortcut('esc', spy1);
      this.component.addShortcut('esc', spy2);
      this.keypress.which = 27;
      this.component.$node.trigger(this.keypress);
      expect(spy1.callCount).toBe(1);
      expect(spy2.callCount).toBe(1);
    });

    it('pageup', function () {
      this.component.addShortcut('pageup', this.spy);
      this.keydown.which = 33;
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);
    });

    it('pagedown', function () {
      this.component.addShortcut('pagedown', this.spy);
      this.keydown.which = 34;
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);
    });
  });

  describe('should call callback for single key', function () {
    beforeEach(function () {
      var callback = function () {
      };
      this.spy = jasmine.createSpy(callback);
    });

    it('"1"', function () {
      this.component.addShortcut('1', this.spy);
      this.keypress.which = '1'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

    it('"a"', function () {
      this.component.addShortcut('a', this.spy);
      this.keypress.which = 'a'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

    it('including when text modifier key is pressed', function () {
      this.component.addShortcut('?', this.spy);

      this.keypress.which = '?'.charCodeAt(0);
      this.keypress.shiftKey = true;
      this.component.$node.trigger(this.keypress);

      expect(this.spy.callCount).toBe(1);
    });

    it('unless function modifier key is pressed', function () {
      this.component.addShortcut('?', this.spy);

      this.keypress.which = '?'.charCodeAt(0);
      this.keypress.ctrlKey = true;
      this.keypress.shiftKey = true;
      this.component.$node.trigger(this.keypress);

      expect(this.spy.callCount).toBe(0);
    });

    it('and only for named key', function () {
      this.component.addShortcut('1', this.spy);
      this.keypress.which = '1'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      this.keypress.which = '2'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

  });

  describe('should call callback for two-key sequence: ', function () {
    beforeEach(function () {
      var callback = function () {
      };
      this.spy = jasmine.createSpy(callback);
    });

    it('c i', function () {
      this.component.addShortcut('c i', this.spy);
      this.keypress.which = 'c'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(0);
      this.keypress.which = 'i'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

    it('on multiple sequence events', function () {
      this.component.addShortcut('c i', this.spy);
      this.keypress.which = 'c'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(0);
      this.keypress.which = 'i'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
      this.keypress.which = 'c'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
      this.keypress.which = 'i'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(2);
    });

    it('if the sequence starter is pressed twice', function () {
      this.component.addShortcut('c i', this.spy);
      this.keypress.which = 'c'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(0);
      this.keypress.which = 'c'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(0);
      this.keypress.which = 'i'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

    describe('and should not callback for', function () {

      beforeEach(function () {
        this.spy2 = jasmine.createSpy('spy');
        this.component.addShortcut('c i', this.spy);
      });

      it('other sequences', function () {
        // add shortcut 'c f'
        this.component.addShortcut('c f', this.spy2);

        // keypress 'c'
        this.keypress.which = 'c'.charCodeAt(0);
        this.component.$node.trigger(this.keypress);

        // keypress 'i'
        this.keypress.which = 'i'.charCodeAt(0);
        this.component.$node.trigger(this.keypress);

        // expect 'c i' callback to have been called
        expect(this.spy.callCount).toBe(1);
        // expect 'c f' callback not to have been called
        expect(this.spy2.callCount).toBe(0);
      });

      it('the second key separately', function () {
        // add event 'i'
        this.component.addShortcut('i', this.spy2);

        // trigger 'c'
        this.keypress.which = 'c'.charCodeAt(0);
        this.component.$node.trigger(this.keypress);

        // expect both callbacks not to have been called
        expect(this.spy.callCount).toBe(0);
        expect(this.spy2.callCount).toBe(0);

        this.keypress.which = 'i'.charCodeAt(0);
        this.component.$node.trigger(this.keypress);

        // expect 'i' callback to have been called
        expect(this.spy.callCount).toBe(1);
        expect(this.spy2.callCount).toBe(0);
      });

      it('the second key twice', function () {
        this.component.addShortcut('c i', this.spy);
        this.keypress.which = 'c'.charCodeAt(0);
        this.component.$node.trigger(this.keypress);

        // expect 'c i' callback not to have been called
        expect(this.spy.callCount).toBe(0);
        this.keypress.which = 'i'.charCodeAt(0);
        this.component.$node.trigger(this.keypress);

        // expect 'c i' callback to have been called
        expect(this.spy.callCount).toBe(1);
        this.keypress.which = 'i'.charCodeAt(0);
        this.component.$node.trigger(this.keypress);

        // expect 'c i' callback to have been called only once
        expect(this.spy.callCount).toBe(1);
      });
    });
  });

  describe('should not call sequence callback for: ', function () {
    beforeEach(function () {
      this.spy = jasmine.createSpy('spy');
    });

    it('two-key sequence with stray key', function () {
      this.component.addShortcut('c i', this.spy);
      this.keypress.which = 'c'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      this.keypress.which = 'a'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      this.keypress.which = 'i'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);

      // expect 'c i' callback not to have been called
      expect(this.spy.callCount).toBe(0);
    });

    it('out of sequence two-key sequence', function () {
      this.component.addShortcut('c i', this.spy);
      this.keypress.which = 'i'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      this.keypress.which = 'c'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);

      // expect 'c i' callback not to have been called
      expect(this.spy.callCount).toBe(0);
    });

  });

  describe('should not listen to events on text fields', function () {

    beforeEach(function () {
      this.spy = jasmine.createSpy('spy');
      this.component.addShortcut('del', this.spy);
      this.keypress.which = 46;
      this.component.$node.append('<textarea>hello</textarea>');
      this.component.$node.append('<input type="text" />');
    });
    it('textareas', function () {
      this.component.$node.find('textarea').trigger(this.keypress);

      // expect 'del' callback not to have been called
      expect(this.spy.callCount).toBe(0);
    });

    it('input', function () {
      this.component.$node.find('input').trigger(this.keypress);

      // expect 'del' callback not to have been called
      expect(this.spy.callCount).toBe(0);
    });

    it('textarea unless specified', function () {
      this.component.addShortcut('esc', this.spy, 'textarea');
      this.keydown.which = 27;
      this.component.$node.find('textarea').trigger(this.keydown);

      // expect 'esc' callback to have been called
      expect(this.spy.callCount).toBe(1);
    });

    it('input unless specified', function () {
      this.component.addShortcut('esc', this.spy, 'input');
      this.keydown.which = 27;
      this.component.$node.find('input').trigger(this.keydown);

      // expect 'esc' callback to have been called
      expect(this.spy.callCount).toBe(1);
    });
  });

  describe('should listen to extended character set', function () {
    beforeEach(function () {
      var callback = function () {
      };
      this.spy = jasmine.createSpy(callback);
    });

    it('?', function () {
      this.component.addShortcut('?', this.spy);
      this.keypress.which = '?'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);

      // expect '?' callback to have been called
      expect(this.spy.callCount).toBe(1);
    });

  });

  describe('should understand modifier keys:', function () {

    beforeEach(function () {
      this.spy = jasmine.createSpy('spy');
      this.spy2 = jasmine.createSpy('spy2');
    });

    it('CTRL+a', function () {
      this.component.addShortcut('CTRL+a', this.spy2);
      this.keypress.which = 'a'.charCodeAt(0);
      this.keypress.ctrlKey = true;
      this.component.$node.trigger(this.keypress);

      // expect 'CTRL+a' callback to have been called
      expect(this.spy2.callCount).toBe(1);
    });


    it('CTRL+', function () {
      this.component.addShortcut('a', this.spy);
      this.component.addShortcut('CTRL+a', this.spy2);
      this.keypress.which = 'a'.charCodeAt(0);
      this.keypress.ctrlKey = true;
      this.component.$node.trigger(this.keypress);

      // expect 'a' callback not to have been called
      expect(this.spy.callCount).toBe(0);
      // expect 'CTRL+a' callback to have been called
      expect(this.spy2.callCount).toBe(1);
    });

    it('ALT+', function () {
      this.component.addShortcut('a', this.spy);
      this.component.addShortcut('ALT+a', this.spy2);
      this.keypress.which = 'a'.charCodeAt(0);
      this.keypress.altKey = true;
      this.component.$node.trigger(this.keypress);

      // expect 'a' callback not to have been called
      expect(this.spy.callCount).toBe(0);
      // expect 'ALT+a' callback to have been called
      expect(this.spy2.callCount).toBe(1);
    });

    it('CMD+', function () {
      this.component.addShortcut('a', this.spy);
      this.component.addShortcut('CMD+a', this.spy2);
      this.component.$node.trigger(this.keydown);
      this.keypress.which = 'a'.charCodeAt(0);
      this.keypress.metaKey = true;
      this.component.$node.trigger(this.keypress);

      // expect 'a' callback not to have been called
      expect(this.spy.callCount).toBe(0);
      // expect 'CMD+a' callback to have been called
      expect(this.spy2.callCount).toBe(1);

    });

    it('and should accept multiple callbacks for the same combo', function () {
      this.component.addShortcut('CMD+a', this.spy);
      this.component.addShortcut('CMD+a', this.spy2);
      this.component.$node.trigger(this.keydown);
      this.keypress.which = 'a'.charCodeAt(0);
      this.keypress.metaKey = true;
      this.component.$node.trigger(this.keypress);

      // expect 'a' callback to have been called
      expect(this.spy.callCount).toBe(1);
      // expect 'CMD+a' callback to have been called
      expect(this.spy2.callCount).toBe(1);
    });

    it('should not fire event when selector does not match', function () {
      this.component.addShortcut('CMD+a', this.spy, '.my-selector');
      this.component.$node.trigger(this.keydown);
      this.keypress.which = 'a'.charCodeAt(0);
      this.keypress.metaKey = true;

      // no matching selector
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(0);
    });

    it('should fire event when selector matches', function () {
      this.component.addShortcut('CMD+a', this.spy, '.my-selector');
      this.component.$node.trigger(this.keydown);
      this.keypress.which = 'a'.charCodeAt(0);
      this.keypress.metaKey = true;

      // matching selector
      this.component.$node.addClass('my-selector');
      this.component.$node.trigger(this.keypress);
      expect(this.spy.callCount).toBe(1);
    });

  });

  it('should provide the key event as the first arg to the callback', function () {
    var spy = jasmine.createSpy('spy');
    this.component.addShortcut('1', spy);
    this.keypress.which = '1'.charCodeAt(0);
    this.component.$node.trigger(this.keypress);
    var e = spy.mostRecentCall.args[0];
    expect(e.which).toBe(this.keypress.which);
  });

  describe('should accept an object as last arg & provide as 2nd arg to callback', function () {

    it('when there is no selector', function () {
      var data = {
        id: 1
      };
      var spy = jasmine.createSpy('spy');
      this.component.addShortcut('1', spy, data);
      this.keypress.which = '1'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(spy.mostRecentCall.args[1]).toBe(data);
    });

    it('when there is a selector', function () {
      var data = {
        id: 1
      };
      var spy = jasmine.createSpy('spy');
      this.component.addShortcut('1', spy, '*', data);
      this.keypress.which = '1'.charCodeAt(0);
      this.component.$node.trigger(this.keypress);
      expect(spy.mostRecentCall.args[1]).toBe(data);
    });
  });

  describe('initialize', function () {
    beforeEach(function () {
      this.spy = spyOnEvent(document, 'test-event');
    });

    it('should register event for key', function () {
      setupComponent({
        shortcuts: {
          esc: [
            {
              eventName: 'test-event'
            }
          ]
        }
      });

      this.keydown.which = 27;
      // should not trigger when selector does not match
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);
    });

    it('should mind selector', function () {
      setupComponent({
        shortcuts: {
          esc: [
            {
              eventName: 'test-event',
              selector: '.someSelector'
            }
          ]
        }
      });

      this.keydown.which = 27;

      // should not trigger when selector does not match
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(0);

      // should trigger for matched selector
      this.component.$node.addClass('someSelector');
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);
    });

    it('should debounce 200ms by default', function () {
      setupComponent({
        shortcuts: {
          esc: [
            {
              eventName: 'test-event'
            }
          ]
        }
      });

      this.keydown.which = 27;
      var keydown2 = jQuery.Event('keydown');
      var keydown3 = jQuery.Event('keydown');
      keydown2.which = 27;
      keydown3.which = 27;

      // should not get called if last trigger was < 200ms ago

      this.component.$node.trigger(this.keydown);
      waits(150);
      runs(function () {
        this.component.$node.trigger(keydown2);
        expect(this.spy.callCount).toBe(1);
      });

      // should get called if last trigger was > 200ms ago

      waits(250);
      runs(function () {
        this.component.$node.trigger(keydown3);
        expect(this.spy.callCount).toBe(2);
      });

    });

    it('should accept global debounce period', function () {
      setupComponent({
        debounce: 100,
        shortcuts: {
          esc: [
            {
              eventName: 'test-event'
            }
          ]
        }
      });

      this.keydown.which = 27;
      var keydown2 = jQuery.Event('keydown');
      var keydown3 = jQuery.Event('keydown');
      keydown2.which = 27;
      keydown3.which = 27;

      // should not get called if last trigger was < debouncePeriod ago

      this.component.$node.trigger(this.keydown);
      waits(50);
      runs(function () {
        this.component.$node.trigger(keydown2);
        expect(this.spy.callCount).toBe(1);
      });

      // should get called if last trigger was > debouncePeriod ago

      waits(100);
      runs(function () {
        this.component.$node.trigger(keydown3);
        expect(this.spy.callCount).toBe(2);
      });

    });

    it('should throttle 100ms by default', function () {
      setupComponent({
        shortcuts: {
          esc: [
            {
              eventName: 'test-event',
              throttle: true
            }
          ]
        }
      });

      this.keydown.which = 27;
      var keydown2 = jQuery.Event('keydown');
      var keydown3 = jQuery.Event('keydown');
      keydown2.which = 27;
      keydown3.which = 27;

      // should callback immediately
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);

      // should not callback if last call was < 100ms ago
      waits(50);
      runs(function () {
        this.component.$node.trigger(keydown2);
        expect(this.spy.callCount).toBe(1);
      });

      // should callback if last call was > 100ms ago
      waits(100); // total 150
      runs(function () {
        this.component.$node.trigger(keydown3);
        expect(this.spy.callCount).toBe(2);
      });

    });

    it('should accept global throttle period', function () {
      setupComponent({
        throttle: 50,
        shortcuts: {
          esc: [
            {
              eventName: 'test-event',
              throttle: true
            }
          ]
        }
      });

      this.keydown.which = 27;
      var keydown2 = jQuery.Event('keydown');
      var keydown3 = jQuery.Event('keydown');
      keydown2.which = 27;
      keydown3.which = 27;

      // should callback immediately
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);

      // should not callback if last call was < throttle period ago
      waits(20);
      runs(function () {
        this.component.$node.trigger(keydown2);
        expect(this.spy.callCount).toBe(1);
      });

      // should callback if last call was > throttle period ago
      waits(70); // total 90
      runs(function () {
        this.component.$node.trigger(keydown3);
        expect(this.spy.callCount).toBe(2);
      });

    });

    it('should accept custom throttle period', function () {
      setupComponent({
        throttle: 100,
        shortcuts: {
          esc: [
            {
              eventName: 'test-event',
              throttle: 50
            }
          ]
        }
      });

      this.keydown.which = 27;
      var keydown2 = jQuery.Event('keydown');
      var keydown3 = jQuery.Event('keydown');
      keydown2.which = 27;
      keydown3.which = 27;

      // should callback immediately
      this.component.$node.trigger(this.keydown);
      expect(this.spy.callCount).toBe(1);

      // should not callback if last call was < throttle period ago
      waits(20);
      runs(function () {
        this.component.$node.trigger(keydown2);
        expect(this.spy.callCount).toBe(1);
      });

      // should callback if last call was > throttle period ago
      waits(70); // total 90
      runs(function () {
        this.component.$node.trigger(keydown3);
        expect(this.spy.callCount).toBe(2);
      });

    });



  });

});

