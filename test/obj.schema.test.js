/* eslint-env mocha */
var assert = require('assert');
var Schema = require('./../src/schema');

var validator = function (obj, definition) {
    var schema = new Schema(definition);
    return schema.validate(obj);
};

describe('Swarm description specific', () => {

    it('should correctly validate a generic swarm description', () => {
        const description = {
            public: {},
            secure: {},
            local: {},
            phases: {
                make: function () { return 'hello' ;},
                makeLink: function () { return 'world'; },
                __mkOneStep: function () { return ' !'; }
            }
        };

        const rules = {
            'public': 'object',
            'secure': 'object',
            'local': 'object',
            'phases': {
                'type': 'object',
                '*': {
                    type: 'function'
                }
            }
        };

        assert.strictEqual(validator(description, rules), true);
    });

});
