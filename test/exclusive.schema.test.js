/* eslint-env mocha */
var assert = require('assert');
var Schema = require('./../src/schema');

// TODO: more tests

var validatorExclusive = function (obj, definition) {
    var schema = new Schema(definition);
    return schema.validate(obj, true);
};

describe('Exclusive validation', () => {

    it('should correctly validate a simple object in exclusive mode', () => {
        const rules = {
            callable: {
                type: 'function'
            }
        };
        const payload = { callable: function () { return 'hello';}};

        assert.strictEqual(validatorExclusive(payload, rules), true);
    });

    it('should correctly validate arrays in exclusive mode', () => {
        const description = {
            public: {},
            secure: {},
            local: {},
            phases: [
                { callable: function () { return 'hello' ;} },
                { callable: function () { return 'world'; } },
                { callable: function () { return ' !'; } }
            ]
        };

        const rules = {
            'public': 'object',
            'secure': 'object',
            'local': 'object',
            'phases': {
                type: 'array',
                '*': {
                    type: 'object',
                    '*': {
                        callable: 'function'
                    }
                }
            }
        };

        assert.strictEqual(validatorExclusive(description, rules), true);
    });

    it('should correctly validate dictionaries in exclusive mode', () => {
        const description = {
            public: {},
            secure: {},
            local: {},
            phases: {
                makeHello: function () { return 'hello' ;},
                makeWorld: function () { return 'world'; },
                makeSign: function () { return ' !'; }
            }
        };

        const rules = {
            'public': 'object',
            'secure': 'object',
            'local': 'object',
            'phases': {
                type: 'dictionary',
                '*': {
                    'type': 'function'
                }
            }
        };

        assert.strictEqual(validatorExclusive(description, rules), true);
    });

});
