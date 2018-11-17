module.exports = function deepCopy(source) {

    // this is because typeof null is "object"
    if (source === null) {
        return source;
    }

    var cloned = source;

    if (Array.isArray(source)) {
        cloned = [];
        source.forEach(item => {
            cloned.push(deepCopy(item));
        });
    } else if (source instanceof Number) {
        cloned = new Number(source);
    } else if (source instanceof RegExp) {
        var pattern = source.source;
        var flags = '';
        // Test for global.
        if (source.global) {
            flags += 'g';
        }
        // Test for ignoreCase.
        if (source.ignoreCase) {
            flags += 'i';
        }
        // Test for multiline.
        if (source.multiline) {
            flags += 'm';
        }
        // Return a clone with the additive flags.
        cloned = new RegExp(pattern, flags);
    } else if (source instanceof Error) {
        cloned = new Error(source.message);
    } else if (source instanceof Date) {
        cloned = new Date(source.valueOf());
    } else if (typeof (source) === 'object') {
        cloned = {};
        Object.keys(source).forEach(key => {
            // we are copying only own properties, no functions
            if (source.hasOwnProperty(key) && typeof source[key] !== 'function') {
                cloned[key] = deepCopy(source[key]);
            }
        });
    }

    return cloned;
};
