# shortcutz

A dead-simple yet powerful keyboard shortcuts manager.

## Examples

```js
// The constructor accepts a first argument to specifiy the Keyboard event type.
// Accepted values are: `keydown` (default), `keypress`, `keyup`.
// The constructor accepts a second argument to specifiy the element context (default: `document`).
var shortz = new Shortcutz();

// Assign one callback to one shortcut.
shortz.add('A', console.log);

// Assign one callback to many shortcuts.
shortz.add(['A', 'ESCAPE'], console.log);

// Assign many callbacks to one shortcut.
shortz.add('CTRL + A', [console.log, console.info]);

// Flexible shortcut definition.
shortz.add('CTRL+A', [console.log, console.info]);

// Listen to `keyup` events in a particular DOM element with ID 'text-editor'.
var keyManager = new Shortcutz('keyup', document.getElementById('text-editor'));
keyManager.add('CTRL + C', function(ev) {
    // Handle CTRL+C shortcut triggered on 'text-editor'.
});
```

## Tests

Run `npm test` and then open `test.html` with your browser.

## Documentation

Run `npm run docs` to generate the documentation in the `docs` directory (autogenerated).

**Note:** You need `jsdoc` to run this command. If that's not the case, run `[sudo] npm i -g jsdoc`.

## Minification

Run `npm run dist` to create the `assert.min.js` file.
This will optimize file requests if you use this lib in a browser.

**Note:** You need `uglifyjs` to run this command. If that's not the case, run `[sudo] npm i -g uglify-js`.

## Code linting

Run `npm run lint` to analyze the source code for potential errors.

**Note:** You need `eslint` to run this command. If that's not the case, run `[sudo] npm i -g eslint`.

## License

This libray is released with the [MIT license](LICENSE).
The only requirement is that you keep my copyright notice intact when you repurpose, redistribute, or reuse this code.
