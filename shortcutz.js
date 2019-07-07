/**
 * A dead-simple yet powerful keyboard shortcuts manager.
 * @param {string} eventType Keyboard event type: keydown (default), keypress, keyup.
 * @author Luis A. Leiva
 * @example
 * var shortz = new Shortcutz();
 * // Assign one callback to one shortcut.
 * shortz.add('A', console.log);
 * // Assign one callback to many shortcuts.
 * shortz.add(['A', 'ESCAPE'], console.log);
 * // Assign many callbacks to one shortcut.
 * shortz.add('CTRL + A', [console.log, console.info]);
 * // Flexible shortcut definition.
 * shortz.add('CTRL+A', [console.log, console.info]);
 */
function Shortcutz(eventType) { // eslint-disable-line no-unused-vars
    // Trigger callback after a keyboard key is released.
    eventType = eventType || 'keydown';
    // Some observations:
    // - The `keypress` event doesn't work well with `CTRL + SHIFT` combos.
    // - The `keydown` event is fired endlessly if key isn't released,
    // however it's the most reliable way of preventing default events.
    // - If we listen to `keyup` events, then events are propagated
    // even if we use `event.preventDefault()`.
    document.addEventListener(eventType, onKey);

    // Map friendly char codes to actual key codes.
    // Seamlessly borrowed from https://github.com/kabirbaidhya/keycode-js
    var charMap = {
        'BACKSPACE': 8,
        'RETURN': 13,
        'ENTER': 14,
        'ESCAPE': 27,
        'SPACE': 32,
        'PAGEUP': 33,
        'PAGEDOWN': 34,
        'END': 35,
        'HOME': 36,
        'LEFT': 37,
        'UP': 38,
        'RIGHT': 39,
        'DOWN': 40,
        'INSERT': 45,
        'DELETE': 46,
        '0': 48,
        '1': 49,
        '2': 50,
        '3': 51,
        '4': 52,
        '5': 53,
        '6': 54,
        '7': 55,
        '8': 56,
        '9': 57,
        'A': 65,
        'B': 66,
        'C': 67,
        'D': 68,
        'E': 69,
        'F': 70,
        'G': 71,
        'H': 72,
        'I': 73,
        'J': 74,
        'K': 75,
        'L': 76,
        'M': 77,
        'N': 78,
        'O': 79,
        'P': 80,
        'Q': 81,
        'R': 82,
        'S': 83,
        'T': 84,
        'U': 85,
        'V': 86,
        'W': 87,
        'X': 88,
        'Y': 89,
        'Z': 90,
    };

    // Allow for several event handlers; e.g.
    // "CTRL + S": [saveDocument, addToFavorite, ...]
    var shortcuts = {};

    function addShortcut(defs, callbacks) {
        // Allow to bind the same callback to multiple shortcuts.
        if (defs.constructor.name !== 'Array') {
            defs = [defs];
        }
        // Allow to bind multiple callbacks to the same shortcut.
        if (callbacks.constructor.name !== 'Array') {
            callbacks = [callbacks];
        }
        // The `shortcuts` object is a `key => [fn]` map.
        for (var i = 0; i < defs.length; i++) {
            var entry = normalize(defs[i]);
            if (!shortcuts[entry]) {
                shortcuts[entry] = [];
            }
            shortcuts[entry] = shortcuts[entry].concat(callbacks);
        }
    }

    function normalize(shortcut) {
        return getModifiers(shortcut).join('+');
    }

    function getModifiers(shortcut) {
        // Shortcuts are defined as `[CTRL +] [SHIFT +] [ALT +] $CHAR`,
        // where `$CHAR` is a single character, i.e. a letter or a digit.
        return shortcut.split(/\s?\+\s?/).map(function(str) {
            // Normalize chars to shortcuts case-insensitive.
            return str.toUpperCase();
        });
    }

    function hasModifier(ev, modifier) {
        if (modifier == 'CTRL') {
            return ev.ctrlKey;
        } else if (modifier == 'ALT') {
            return ev.altKey;
        } else if (modifier == 'SHIFT') {
            return ev.shiftKey;
        } else if (modifier == 'META') {
            return ev.metaKey;
        } else {
            console.warn('Unknown shortcut modifier:', modifier);
            return false;
        }
    }

    function onKey(ev) {
        // Iterate over the list of user-defined shortcuts,
        // which can change in the lifecycle of the app,
        // so we have to retrieve it everytime a key event is fired.
        var code = ev.which || ev.keyCode;
        // There can be "conflicting" shortcuts, such as "CTRL + A" and "CTRL + SHIFT + A",
        // thus we have to process shortcuts with higher priority first.
        var priorities = Object.keys(shortcuts).reduce(function(acc, key) {
            var priority = getModifiers(key).length;
            if (!acc[priority]) {
                acc[priority] = [];
            }
            acc[priority].push(key);
            return acc;
        }, {});

        var maxPriority = Object.keys(priorities).sort().pop();
        for (var p = maxPriority; p > 0; p--) {
            var entries = priorities[p];
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                // The actual key char is always the last key modifier.
                var modifiers = getModifiers(entry);
                var character = modifiers.pop();
                if (code === charMap[character]) {
                    // Ensure that we're hitting the right shortcut,
                    // for which all key modifiers must match.
                    var count = modifiers.length;
                    modifiers.forEach(function(val) {
                        if (hasModifier(ev, val)) {
                            count--;
                        }
                    });
                    // Shortcuts are unique, so if a match is found don't execute further events.
                    // This prevents conflicting shortcuts, see discussion above.
                    if (count === 0) {
                        ev.preventDefault();

                        var callbacks = shortcuts[entry];
                        callbacks.forEach(function(fn) {
                            // Pass in a custom event with additional data to the callback.
                            var custom = new CustomEvent(eventType, {detail: {shortcut: entry}});
                            for (var prop in ev) custom[prop] = ev[prop]; // eslint-disable-line guard-for-in
                            fn(custom);
                        });
                        // Don't execute further events.
                        return;
                    }
                }
            }
        }
    }

    // Expose lib.
    this.add = addShortcut;
    // For convenience, expose the previous charmap so that others can extend it easily.
    this.KEY = charMap;
    // Debug only.
    this.defs = shortcuts;
}
