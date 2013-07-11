# flight-keyboard-shortcuts

[![Build Status](https://secure.travis-ci.org/<username>/flight-keyboard-shortcuts.png)](http://travis-ci.org/<username>/flight-keyboard-shortcuts)

A [Flight](https://github.com/flightjs/flight) component for keyboard shortcuts

## Installation

```bash
bower install --save flight-keyboard-shortcuts
```

## Example

```javascript
var keyboardShortcuts = require('component/keyboard-shortcuts');
keyboardShortcuts.attachTo(document, {
  esc: [
    {
      eventName: 'close-dialog'
    },
    {
      eventName: 'unfocus',
      selector: 'textarea, input'
    }
  ],
  c: [
    {
      eventName: 'compose-tweet'
    }
  ],
  'CTRL+ret': [
    {
      eventName: 'send-tweet'
      throttle: true
    }
  ]
});
```

## Events

## single key:
```javascript
this.trigger('shortcut-add', {
 shortcut: 'c',
 eventName: 'compose-tweet'
});
```

## throttled (100ms):
```javascript
this.trigger('shortcut-add', {
 shortcut: 'c',
 eventName: 'compose-tweet',
 throttle: true
});
```

## named key:
```javascript
this.trigger('shortcut-add', {
 shortcut: 'esc',
 eventName: 'close-dialog'
});
```

## sequence:
```javascript
this.trigger('shortcut-add', {
 shortcut: 'g i',
 eventName: 'go-inbox'
});
```

## combo:
```javascript
this.trigger('shortcut-add', {
 shortcut: 'CTRL+ret',
 eventName: 'send-tweet'
});
```

Text inputs (input, textarea) are ignored by default. if you want to listen to events on input
elements, add a selector as a third parameter:

```javascript
this.trigger('shortcut-add', {
 shortcut: 'esc',
 eventName: 'unfocus',
 selector: 'textarea, input'
});
```

## remove all shortcuts for a key
```javascript
this.trigger('shortcut-remove', {
 shortcut: 'esc'
});
```

## Development

Development of this component requires [Bower](http://bower.io), and preferably
[Karma](http://karma-runner.github.io) to be globally installed:

```bash
npm install -g bower karma
```

Then install the Node.js and client-side dependencies by running the following
commands in the repo's root directory.

```bash
npm install
bower install
```

To continuously run the tests in Chrome and Firefox during development, just run:

```bash
karma start
```

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

* [Bug reports](CONTRIBUTING.md#bugs)
* [Feature requests](CONTRIBUTING.md#features)
* [Pull requests](CONTRIBUTING.md#pull-requests)
