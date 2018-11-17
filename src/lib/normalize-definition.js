module.exports = function (definition, key) {

    if (!key) {
        throw {
            error: true,
            type: 'invalid',
            code: 'key',
            name: '',
            message: 'Invalid call to definition parser, no key supplied'
        };
    }

    var def = {};
    if (typeof definition === 'string') {
        def = {
            '@key': key,
            'nullable': false,
            'type': definition
        };
    } else {
        def = Object.assign({}, definition);
    }

    if (!def['type']) {
        def['type'] = 'mixed';
    }

    def['@key'] = key;

    if (def.nullable === undefined) {
        def.nullable = false;
    }

    def.required = !!def.required;

    return def;
};
