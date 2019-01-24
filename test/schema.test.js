/* eslint-env mocha */
var assert = require('assert');
var Schema = require('./../src/schema');

var validator = function (obj, definition) {
    var schema = new Schema(definition);
    return schema.validate(obj);
};

describe('Validating types', () => {
    describe('Nullable', () => {
        it('should pass a nullable value, even with other enforced rules', () => {
            assert.equal(validator({ name: null }, {
                name: {
                    type: 'string',
                    nullable: true,
                    min: 10,
                    max: 255
                }
            }), true);
        });
    });

    describe('Testing types with correct values', () => {

        it('should pass positive floating point', () => {
            var schema = new Schema({ price: 'float' });
            assert.equal(schema.validate({ price: 1.99 }), true);
        });

        it('should pass negative floating point', () => {
            var schema = new Schema({ price: 'float' });
            assert.equal(schema.validate({ price: -1.99 }), true);
        });

        it('should pass zero floating point', () => {
            assert.equal(validator({ rebate: 0 }, { rebate: 'float' }), true);
        });

        it('should pass bool true', () => {
            assert.equal(validator({ enabled: true }, { enabled: 'bool' }), true);
        });

        it('should pass bool false', () => {
            assert.equal(validator({ active: false }, { active: 'bool' }), true);
        });

        it('should pass array', () => {
            assert.equal(validator({ options: [1, 2, 3] }, { options: 'array' }), true);
        });

        it('should pass empty array', () => {
            assert.equal(validator({ options: [] }, { options: 'array' }), true);
        });

        it('should pass object', () => {
            assert.equal(validator({ prefs: { a: true, b: false } }, { prefs: 'object' }), true);
        });

        it('should pass empty object', () => {
            assert.equal(validator({ prefs: {} }, { prefs: 'object' }), true);
        });

        it('should pass a date value', () => {
            assert.equal(validator({ now: new Date() }, { born_at: 'date' }), true);
        });

    });

    describe('Integer type', () => {

        it('should pass positive integer value', () => {
            assert.equal(validator({ age: 20 }, { age: 'integer' }), true);
        });

        it('should pass negative integer value', () => {
            assert.equal(validator({ credit: -1220 }, { credit: 'integer' }), true);
        });

        it('should pass zero as integer value', () => {
            assert.equal(validator({ debt: 0 }, { debt: 'integer' }), true);
        });

        [
            { age: '20' },
            { age: true, },
            { age: { value: 20 } },
            { age: 3.1415926 },
            { age: () => true },
            { age: [1, 2, 3], },
            { age: [] },
        ].forEach(val => {
            it('should fail for ' + typeof val.age + ' value', () => {
                assert.throws(
                    () => validator(val, { age: 'integer' }),
                    (err) => (err instanceof Error)
                );
            });
        });
    });

    describe('String type', () => {

        it('should pass non-empty string value ', () => {
            assert.equal(validator({ name: 'Jon Appleseed' }, { name: 'string' }), true);
        });

        it('should pass empty string value', () => {
            assert.equal(validator({ name: '' }, { name: 'string' }), true);
        });

        [
            { name: 20 },
            { name: true, },
            { name: { value: 'Jack' } },
            { name: 3.1415926 },
            { name: () => true },
            { name: ['A', 'B', 'C'], },
            { name: [] },
        ].forEach(val => {
            it('should fail for ' + typeof val.name + ' value', () => {
                assert.throws(
                    () => validator(val, { name: 'string' }),
                    (err) => (err instanceof Error)
                );
            });
        });

    });

    describe('Floating point type', () => {
        it('should pass positive floating point value', () => {
            assert.equal(validator({ price: 1.99 }, { price: 'float' }), true);
        });

        it('should pass integer value positive', () => {
            assert.equal(validator({ price: 199 }, { price: 'float' }), true);
        });

        it('should pass negative floating point value', () => {
            assert.equal(validator({ price: -1.99 }, { price: 'float' }), true);
        });

        it('should pass negative integer value', () => {
            assert.equal(validator({ price: -199 }, { price: 'float' }), true);
        });

        it('should pass zero floating point value', () => {
            assert.equal(validator({ rebate: 0.0 }, { rebate: 'float' }), true);
        });

        it('should pass zero integer value', () => {
            assert.equal(validator({ rebate: 0 }, { rebate: 'float' }), true);
        });

        [
            { price: '20' },
            { price: true, },
            { price: { value: 'Jack' } },
            { price: () => true },
            { price: ['A', 'B', 'C'], },
            { price: [] },
        ].forEach(val => {
            it('should fail for ' + typeof val.price + ' value', () => {
                assert.throws(
                    () => validator(val, { price: 'float' }),
                    (err) => (err instanceof Error)
                );
            });
        });
    });

    describe('Boolean type', () => {

        it('should pass bool true value', () => {
            assert.equal(validator({ enabled: true }, { enabled: 'bool' }), true);
        });

        it('should pass bool false value', () => {
            assert.equal(validator({ active: false }, { active: 'bool' }), true);
        });

        [
            { name: 20 },
            { name: [], },
            { name: ['A', 'B', 'C'], },
            { name: '20' },
            { name: 'true' },
            { name: 'false' },
            { name: { value: 'Jack' } },
            { name: 3.1415926 },
            { name: () => true }
        ].forEach(val => {
            it('should fail for ' + typeof val.name + ' value', () => {
                assert.throws(
                    () => validator(val, { name: 'bool' }),
                    (err) => (err instanceof Error)
                );
            });
        });
    });

    describe('ISO Date', () => {
        [
            { born_at: '2000-11-01' },
            { born_at: '2000-02-29' },
        ].forEach(val => {
            it('should pass for for ' + val.born_at + ' valid date', () => {
                assert.equal(validator(val, { born_at: 'iso_date' }), true);
            });
        });

        [
            { born_at: '2000-11-00' },
            { born_at: '2000-13-00' },
            { born_at: '2000-00-01' },
            { born_at: '2000-01-32' },
            { born_at: '2001-02-29' },
            { born_at: '2001-02-29 11:22:33' },
            { born_at: '2000-11-00 11:22:33' },
            { born_at: '2000-13-00 11:22:33' },
            { born_at: '2000-00-01 11:22:33' },
            { born_at: '2000-01-32 11:22:33' },
            { born_at: '2000-01-01 00:00:60' },
            { born_at: '2000-01-01 00:00:96' },
            { born_at: '2000-01-01 24:00:00' },
            { born_at: '2000-01-01 75:00:00' },
            { born_at: '2000-01-01 00:60:00' },
            { born_at: '2000-01-01 00:73:00' },
        ].forEach(val => {
            it('should fail for ' + val.born_at + ' invalid date', () => {
                assert.throws(
                    () => validator(val, { born_at: 'iso_date_long' }),
                    (err) => (err instanceof Error)
                );
            });
        });
    });

    describe('Array', () => {

        it('should pass an array value', () => {
            assert.equal(validator({ options: [1, 2, 3] }, { options: 'array' }), true);
        });

        it('should pass an empty array value', () => {
            assert.equal(validator({ options: [] }, { options: 'array' }), true);
        });

        [
            { options: '20' },
            { options: true, },
            { options: { value: 'Jack' } },
            { options: () => true },
            { options: 300, },
        ].forEach(val => {
            it('should fail for ' + typeof val.options + ' value', () => {
                assert.throws(
                    () => validator(val, { options: 'array' }),
                    (err) => (err instanceof Error)
                );
            });
        });
    });

    describe('Object', () => {

        it('should pass an object value', () => {
            assert.equal(validator({ options: { a: 10, b: 20 } }, { options: 'object' }), true);
        });

        it('should pass an empty object value', () => {
            assert.equal(validator({ options: {} }, { options: 'object' }), true);
        });

        it('should fail for array value', () => {
            assert.throws(
                () => validator({ options: ['Peter', 'Pan'] }, { options: 'object' }),
                (err) => (err instanceof Error)
            );
        });

        [
            { options: '20' },
            { options: true, },
            { options: () => ({ a: true, b: 2, c: 3 }) },
            { options: 300, },
        ].forEach(val => {
            it('should fail for ' + typeof val.options + ' value', () => {
                assert.throws(
                    () => validator(val, { options: 'object' }),
                    (err) => (err instanceof Error)
                );
            });
        });
    });

    describe('Function', () => {

        it('should pass for a function definition', () => {
            let payload = {
                iterator: 0,
                phase1 () {
                    this.iterator += 1;
                },
                phase2 () {
                    return this.iterator > 10;
                }
            };
            let schDef = {
                phase1: 'function',
                phase2: 'function',
                iterator: 'integer',
            };
            assert.equal(validator(payload, schDef), true);
        });

        it('should differentiate between an object and a function', () => {
            let payload = {
                iterator: 0,
                phase1 () {
                    this.iterator += 1;
                },
                phase2 () {
                    return this.iterator > 10;
                }
            };
            let schDef = {
                phase1: 'object',
                phase2: 'function',
                iterator: 'integer',
            };
            assert.throws(
                () => validator(payload, schDef),
                (err) => (err instanceof Error)
            );
        });

        it('should be able to validate a slightly more complex payload', () => {
            let payload = {
                iterator: { val: 0, step: () => { this.iterator.val += 1; } },
                phase1: () => {
                    this.iterator.step();
                },
                phase2 () { return this.iterator.val > 10; },
                phase3: new Function('a', 'b', 'return a + b;')
            };
            payload.loaders = [payload.phase1, payload.phase2];
            let schDef = {
                phase1: 'function',
                phase2: 'function',
                phase3: 'function',
                iterator: {
                    type: 'object',
                    '*': {
                        val: 'integer',
                        step: 'function'
                    }
                },
                loaders: {
                    type: 'array',
                    '*': 'function'
                }
            };
            assert.equal(validator(payload, schDef), true);
        });
    });

    it('should correctly validate a custom type registered locally', () => {
        var schema = new Schema({ person: '@person' });
        schema.register('@person', function (value) {
            return value &&
                value.name &&
                value.age &&
                value.profession &&
                value.name.length >= 10 &&
                value.age === parseInt(value.age) &&
                value.age >= 18 &&
                ['programmer', 'developer', 'designer'].indexOf(value.profession) >= 0;
        });

        assert.equal(schema.validate({ person: { name: 'Bill Gates', age: 60, profession: 'developer' } }), true);
    });

    it('should correctly validate a custom type registered globally', () => {
        Schema.register('@person', function (value) {
            return value &&
                value.name &&
                value.age &&
                value.profession &&
                value.name.length >= 10 &&
                value.age === parseInt(value.age) &&
                value.age >= 18 &&
                ['programmer', 'developer', 'designer'].indexOf(value.profession) >= 0;
        });

        var schema = new Schema({ person: '@person' });
        assert.equal(schema.validate({ person: { name: 'Bill Gates', age: 60, profession: 'developer' } }), true);
    });

    it('should correctly invalidate a custom type registered locally', () => {
        var schema = new Schema({ person: '@person' });
        schema.register('@person', function (value) {
            return value &&
                value.name &&
                value.age &&
                value.profession &&
                value.name.length >= 10 &&
                value.age === parseInt(value.age) &&
                value.age >= 18 &&
                ['programmer', 'developer', 'designer'].indexOf(value.profession) >= 0;
        });

        assert.throws(
            () => schema.validate({ person: { name: 'Elon Musk', age: 60, profession: 'manager' } }),
            (err) => (err instanceof Error)
        );
    });

    it('should correctly invalidate a custom type registered globally', () => {
        Schema.register('@person', function (value) {
            return value &&
                value.name &&
                value.age &&
                value.profession &&
                value.name.length >= 10 &&
                value.age === parseInt(value.age) &&
                value.age >= 18 &&
                ['programmer', 'developer', 'designer'].indexOf(value.profession) >= 0;
        });

        var schema = new Schema({ person: '@person' });

        assert.throws(
            () => schema.validate({ person: { name: 'Elon Musk', age: 60, profession: 'manager' } }),
            (err) => (err instanceof Error)
        );
    });

    it('should correctly validate a custom type registered locally using built-in check', () => {
        var schema = new Schema({ person: '@person' });
        schema.register('@person', function (value) {
            return schema.check(value, {
                type: 'object',
                '*': {
                    name: {
                        type: 'string',
                        required: true
                    },
                    age: {
                        type: 'integer',
                        required: true,
                        min: 18,
                    },
                    profession: {
                        type: 'string',
                        required: true,
                        in: ['programmer', 'developer', 'designer']
                    }
                }
            }, 'person');
        });

        assert.equal(schema.validate({ person: { name: 'Bill Gates', age: 60, profession: 'developer' } }), true);
    });

    it('should validate a simple custom type registered locally using rule defs', () => {
        var schema = new Schema({ foo: '@number' });
        schema.register('@number', {
            type: 'integer',
            min: 10,
            max: 20
        });
        assert.equal(schema.validate({ foo: 15 }), true);
    });

    it('should validate a simple custom type registered globally using rule defs', () => {
        Schema.register('@number', {
            type: 'integer',
            min: 10,
            max: 20
        });

        var schema = new Schema({ foo: '@number' });
        assert.equal(schema.validate({ foo: 15 }), true);
    });

    it('should invalidate a simple custom type registered globally using rule defs', () => {
        Schema.register('@number', {
            type: 'integer',
            min: 10,
            max: 20
        });

        var schema = new Schema({ foo: '@number' });
        assert.throws(
            () => schema.validate({ foo: 21 }),
            (err) => (err instanceof Error)
        );
    });

    it('should correctly validate a complex object registered locally using rule defs', () => {
        var schema = new Schema({ person: '@person' });
        schema.register('@person', {
            type: 'object',
            '*': {
                name: {
                    type: 'string',
                    required: true
                },
                age: {
                    type: 'integer',
                    required: true,
                    min: 18,
                },
                profession: {
                    type: 'string',
                    required: true,
                    in: ['programmer', 'developer', 'designer']
                }
            }
        });

        assert.equal(schema.validate({ person: { name: 'Bill Gates', age: 60, profession: 'developer' } }), true);
    });

    it('should correctly invalidate a complex object registered locally using rule defs', () => {
        var schema = new Schema({ person: '@person' });
        schema.register('@person', {
            type: 'object',
            '*': {
                name: {
                    type: 'string',
                    required: true
                },
                age: {
                    type: 'integer',
                    required: true,
                    min: 18,
                },
                profession: {
                    type: 'string',
                    required: true,
                    in: ['programmer', 'developer', 'designer']
                }
            }
        });

        assert.throws(
            () => schema.validate(schema.validate({ person: { name: 'Sheldon Cooper', age: 11, profession: 'scientist' } })),
            (err) => (err instanceof Error)
        );

        assert.throws(
            () => schema.validate(schema.validate({ person: { name: 'Mark Twain', age: 55, profession: 'writer' } })),
            (err) => (err instanceof Error)
        );
    });

    it('should correctly pick the local validation over global one', () => {
        Schema.register('@person', function (value) {
            return value && value.name === 'Vader';
        });

        var schema = new Schema({ person: '@person' });

        schema.register('@person', function (value) {
            return value && value.name === 'Anakin';
        });

        var anotherSchema = new Schema({ person: '@person' });

        assert.equal(schema.validate({ person: { name: 'Anakin' } }), true);
        assert.throws(
            () => schema.validate({ person: { name: 'Vader' } }),
            (err) => (err instanceof Error)
        );
        assert.equal(anotherSchema.validate({ person: { name: 'Vader' } }), true);
        assert.throws(
            () => anotherSchema.validate({ person: { name: 'Anakin' } }),
            (err) => (err instanceof Error)
        );
    });
});

describe('Validating rules', () => {

    describe('Rule: required', () => {

        it('should pass for a defined value', () => {
            assert.equal(validator({ name: 'Vader' }, { name: { type: 'string', required: true } }), true);
        });

        it('should pass for a defined integer value equal to zero', () => {
            assert.equal(validator({ discount: 0 }, { discount: { type: 'integer', required: true } }), true);
        });

        it('should pass for a defined empty string value', () => {
            assert.equal(validator({ name: '' }, { name: { type: 'string', required: true } }), true);
        });

        it('should pass for a defined empty object', () => {
            assert.equal(validator({ person: {} }, { person: { type: 'object', required: true } }), true);
        });

        it('should fail for an undefined value', () => {
            assert.throws(
                () => validator({ property: '' }, { valid: { type: 'mixed', required: true } }),
                (err) => (err instanceof Error)
            );
        });
    });

    describe('Rule: Min', () => {

        it('should pass for bigger integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', min: 17 } }), true);
        });

        it('should pass for equal integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', min: 18 } }), true);
        });

        it('should fail for invalid integer', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', min: 19 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for bigger float value', () => {
            assert.equal(validator({ age: 18.0 }, { age: { type: 'float', min: 17.99 } }), true);
        });

        it('should pass for equal float value', () => {
            assert.equal(validator({ age: 18.123 }, { age: { type: 'float', min: 18.123 } }), true);
        });

        it('should fail for invalid float', () => {
            assert.throws(
                () => validator({ age: 18.123 }, { age: { type: 'float', min: 18.124 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for bigger string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', min: 14 } }), true);
        });

        it('should pass for equal string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', min: 15 } }), true);
        });

        it('should fail for invalid string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', min: 16 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for empty string', () => {
            assert.throws(
                () => validator({ name: '' }, { name: { type: 'string', min: 16 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for bigger array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', min: 3 } }), true);
        });

        it('should pass for equal array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', min: 4 } }), true);
        });

        it('should fail for invalid array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', min: 5 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for empty array', () => {
            assert.throws(
                () => validator({ options: [] }, { options: { type: 'array', min: 16 } }),
                (err) => (err instanceof Error)
            );
        });

    });

    describe('Rule: Max', () => {

        it('should pass for smaller integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', max: 19 } }), true);
        });

        it('should pass for equal integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', max: 18 } }), true);
        });

        it('should fail for invalid integer', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', max: 17 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for smaller string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', max: 16 } }), true);
        });

        it('should pass for equal string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', max: 15 } }), true);
        });

        it('should fail for invalid string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', max: 14 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for empty string', () => {
            assert.equal(validator({ name: '' }, { name: { type: 'string', max: 16 } }), true);
        });

        it('should pass for smaller array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', max: 5 } }), true);
        });

        it('should fail for equal array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', max: 4 } }), true);
        });

        it('should fail for invalid array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', max: 3 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for empty array', () => {
            assert.equal(validator({ options: [] }, { options: { type: 'array', max: 0 } }), true);
        });

    });

    describe('Rule: Exact', () => {

        it('should pass for equal integer value', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', exact: 18 } }), true);
        });

        it('should pass for negative equal integer value', () => {
            assert.equal(validator({ age: -18 }, { age: { type: 'integer', exact: -18 } }), true);
        });

        it('should fail for non-equal integer value', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', exact: 17 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for negative non-equal integer value', () => {
            assert.throws(
                () => validator({ age: -18 }, { age: { type: 'integer', exact: -17 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for equal string length', () => {
            assert.equal(validator({ name: 'Albert Einstein' }, { name: { type: 'string', exact: 15 } }), true);
        });

        it('should fail for non-equal string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', exact: 16 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for non-equal string length', () => {
            assert.throws(
                () => validator({ name: 'Albert Einstein' }, { name: { type: 'string', exact: 14 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for equal array length', () => {
            assert.equal(validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', exact: 4 } }), true);
        });

        it('should fail for non-equal array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', exact: 5 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for non-equal array length', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4] }, { options: { type: 'array', exact: 3 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for empty array', () => {
            assert.throws(
                () => validator({ options: [] }, { options: { type: 'array', exact: 1 } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for empty array with exact 0', () => {
            assert.equal(validator({ options: [] }, { options: { type: 'array', exact: 0 } }), true);
        });

    });

    describe('Rule: alpha', () => {

        it('should pass for alpha-only string', () => {
            assert.equal(validator({ name: 'Obi Wan Kenobi' }, { name: { type: 'string', alpha: true } }), true);
        });

        it('should fail for strings with digits', () => {
            assert.throws(
                () => validator({ name: 'Kink Louis The 14th' }, { name: { type: 'string', alpha: true } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for strings with comma', () => {
            assert.throws(
                () => validator({ name: 'Help me, please' }, { name: { type: 'string', alpha: true } }),
                (err) => (err instanceof Error)
            );
        });

        it('should fail for strings with dots', () => {
            assert.throws(
                () => validator({ name: 'Here we go...' }, { name: { type: 'string', alpha: true } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for negating rule and digits string', () => {
            assert.equal(validator({ name: '9873945873945' }, { name: { type: 'string', alpha: false } }), true);
        });

    });

    describe('Rule: alphanumeric', () => {

        it('should pass for valid strings', () => {
            assert.equal(validator({ name: 'Kink Louis The 14th' }, { name: { type: 'string', alphanumeric: true } }), true);
        });

        it('should fail for string with exclamation mark', () => {
            assert.throws(
                () => validator({ name: 'I got you, babe!' }, { name: { type: 'string', alphanumeric: true } }),
                (err) => (err instanceof Error)
            );
        });

    });

    describe('Rule: in', () => {

        it('should pass for valid integer', () => {
            assert.equal(validator({ age: 18 }, { age: { type: 'integer', in: [11, 12, 13, 18, 19] } }), true);
        });

        it('should fail for invalid integer', () => {
            assert.throws(
                () => validator({ age: 17 }, { age: { type: 'integer', in: [11, 12, 13, 18, 19] } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for valid string', () => {
            assert.equal(validator({ name: 'Luke' }, { name: { type: 'string', in: ['Luke', 'Leia', 'Yoda'] } }), true);
        });

        it('should fail for invalid string', () => {
            assert.throws(
                () => validator({ name: 'Vader' }, { name: { type: 'string', in: ['Luke', 'Leia', 'Yoda'] } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for valid array', () => {
            assert.equal(validator({ options: [1, 2, 3, 1, 3, 2] }, { options: { type: 'array', in: [1, 2, 3] } }), true);
        });

        it('should fail for invalid array values', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4, 1, 3, 2] }, { options: { type: 'array', in: [1, 2, 3] } }),
                (err) => (err instanceof Error)
            );
        });

    });

    describe('Rule: not_in', () => {

        it('should pass for missing integer', () => {
            assert.equal(validator({ age: 17 }, { age: { type: 'integer', not_in: [11, 12, 13, 18, 19] } }), true);
        });

        it('should fail for present integer', () => {
            assert.throws(
                () => validator({ age: 18 }, { age: { type: 'integer', not_in: [11, 12, 13, 18, 19] } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for missing string', () => {
            assert.equal(validator({ name: 'Vader' }, { name: { type: 'string', not_in: ['Luke', 'Leia', 'Yoda'] } }), true);
        });

        it('should fail for present string', () => {
            assert.throws(
                () => validator({ name: 'Luke' }, { name: { type: 'string', not_in: ['Luke', 'Leia', 'Yoda'] } }),
                (err) => (err instanceof Error)
            );
        });

        it('should pass for valid array', () => {
            assert.equal(validator({ options: [1, 2, 3, 1, 3, 2] }, { options: { type: 'array', not_in: [0, 4, 5] } }), true);
        });

        it('should fail for invalid array values', () => {
            assert.throws(
                () => validator({ options: [1, 2, 3, 4, 1, 3, 2] }, { options: { type: 'array', not_in: [0, 4, 5] } }),
                (err) => (err instanceof Error)
            );
        });

    });

    describe('Validating arrays', () => {
        var def = {
            ages: {
                type: 'array',
                min: 3,
                max: 10,
                '*': {
                    type: 'integer',
                    min: 18,
                    max: 26
                }
            }
        };

        it('should correctly validate an integer array', () => {
            var passing = { ages: [18, 19, 20, 21, 22, 23, 24, 25] };
            assert.equal(validator(passing, def), true);
        });

        it('should correctly invalidate an invalid array', () => {
            var failing = { ages: [18, 19, 25, 30] };
            assert.throws(
                () => validator(failing, def),
                (err) => (err instanceof Error)
            );
        });
    });

    describe('Validating objects', () => {
        var def = {
            actor: {
                type: 'object',
                '*': {
                    name: {
                        type: 'string',
                        min: 3,
                        max: 15
                    },
                    age: {
                        type: 'integer',
                        min: 18,
                        max: 50
                    }
                }
            }
        };

        it('should correctly validate an object', () => {
            var actor = {
                name: 'Jason Bourne',
                age: 30,
            };
            assert.equal(validator({ actor }, def), true);
        });

        it('should correctly invalidate an object', () => {
            var oldActor = {
                name: 'Gandalf',
                age: 170,
            };
            assert.throws(
                () => validator({ actor: oldActor }, def),
                (err) => (err instanceof Error)
            );
        });
    });

    describe('Validating array of objects', () => {
        var def = {
            actors: {
                type: 'array',
                '*': {
                    type: 'object',
                    '*': {
                        name: 'string',
                        age: {
                            type: 'integer',
                            min: 18,
                            max: 50
                        }
                    }
                }
            }
        };

        it('should correctly validate an array of objects', () => {
            var actors = [
                { name: 'Jason Bourne', age: 30 },
                { name: 'Thomas Anderson (Neo)', age: 45 },
            ];
            assert.equal(validator({ actors }, def), true);
        });

        it('should correctly invalidate an array of objects', () => {
            var actors = [
                { name: 'Jason Bourne', age: 30 },
                { name: 'Thomas Anderson (Neo)', age: 45 },
                { name: 'Gandalf', age: 185 },
            ];
            assert.throws(
                () => validator({ actors }, def),
                (err) => (err instanceof Error)
            );
        });
    });
});

describe('Serializer', () => {

    it('should correctly pack and unpack a simple object', () => {
        var schema = new Schema({ 'names': { type: 'array' } });
        var payload = {
            names: [
                'Anakin Skywalker',
                'Luke Skywalker',
            ]
        };

        var package = schema.pack(payload);

        var unpacked = schema.unpack(package);
        assert.deepEqual(unpacked, payload);
    });

    it('should correctly pack and unpack a Date object', () => {

        var schema = new Schema({ birth_date: { type: 'date' } });
        var payload = {
            birth_date: new Date(2000, 3, 4, 5, 6, 7, 8)
        };
        var package = schema.pack(payload);
        var unpacked = schema.unpack(package);

        assert.equal(unpacked.birth_date instanceof Date, true);
        assert.equal(unpacked.birth_date.valueOf(), payload.birth_date.valueOf());
        assert.deepEqual(unpacked.birth_date, payload.birth_date);

    });
});


describe('Exclusive', () => {

    it('should have global exclusive option default to false', () => {
        assert.strictEqual(Schema.exclusive(), false);
    });

    it('should be able to set global exclusive mode', () => {
        const initial = Schema.exclusive();
        const changed = !initial;
        assert.strictEqual(Schema.exclusive(), initial);
        assert.strictEqual(initial !== changed, true);
        Schema.exclusive(changed);
        assert.strictEqual(Schema.exclusive(), changed);
        Schema.exclusive(initial);
        assert.strictEqual(Schema.exclusive(), initial);
    });

    it('global exclusive setter should be fluent', () => {
        const ex = Schema.exclusive();
        assert.equal(typeof ex === 'boolean', true);
        assert.deepEqual(Schema.exclusive(ex), Schema);
    });

    it('should be able to pass correctly formed object', () => {

        const initial = Schema.exclusive();
        Schema.exclusive(true);

        const sch = new Schema({
            name: 'string',
            profession: 'string',
            age: 'integer'
        });

        assert.equal(sch.validate({ name: 'Thor', profession: 'God', age: 93800 }), true);
        Schema.exclusive(initial);
    });

    it('should be able to detect a foreign property', () => {

        const initial = Schema.exclusive();
        Schema.exclusive(true);

        const sch = new Schema({
            name: 'string',
            profession: 'string',
            age: 'integer'
        });

        assert.throws(
            () => sch.validate({ name: 'Loki', profession: 'trickster', age: 99845, trick: 'neat one' }),
            (err) => {
                // make everything as it was, not to mess other tests, as this is a global option
                Schema.exclusive(initial);
                return err.message.indexOf('xclusive') >= 0;
            }
        );
    });

    it('should be able to detect a foreign property on complex type', () => {

        const initial = Schema.exclusive();
        Schema.exclusive(true);

        const sch = new Schema({
            person: {
                type: 'object',
                '*': {
                    name: 'string',
                    profession: 'string',
                    age: 'integer'
                }
            }
        });

        assert.throws(
            () => sch.validate({
                person: {
                    name: 'Loki',
                    profession: 'trickster',
                    age: 99845,
                    trick: 'neat one'
                }
            }),
            (err) => {
                // make everything as it was, not to mess other tests, as this is a global option
                Schema.exclusive(initial);
                return err.message.indexOf('xclusive') >= 0;
            }
        );
    });

    it('should be able to detect a foreign property on an array', () => {

        const initial = Schema.exclusive();
        Schema.exclusive(true);

        const sch = new Schema({
            person: {
                type: 'object',
                '*': {
                    name: 'string',
                    profession: 'string',
                    age: 'integer',
                    friends: {
                        type: 'array',
                        '*': {
                            type: 'object',
                            '*': {
                                name: 'string'
                            }
                        }
                    }
                }
            }
        });

        assert.throws(
            () => sch.validate({
                person: {
                    name: 'Jack Sparrow',
                    profession: 'pirate',
                    age: 60,
                    friends: [
                        { name: 'Barbossa' },
                        { name: 'Blackbeard' },
                        { name: 'Davy Jones', enemy: true },
                        { name: 'Will Turner' }
                    ]
                }
            }),
            (err) => {
                // make everything as it was, not to mess other tests, as this is a global option
                Schema.exclusive(initial);
                return err.message.indexOf('xclusive') >= 0;
            }
        );
    });

    it('should be able to pass exclusive option on validate function', () => {

        const sch = new Schema({
            name: 'string',
            profession: 'string',
            age: 'integer'
        });

        assert.throws(
            () => sch.validate({ name: 'Loki', profession: 'trickster', age: 99845, trick: 'neat one' }, true),
            (err) => {
                return err.message.indexOf('xclusive') >= 0;
            }
        );
    });



    //=======================================================================

    it('should be able to pass correctly formed object locally', () => {

        const sch = new Schema({
            name: 'string',
            profession: 'string',
            age: 'integer'
        });

        assert.equal(sch.validate({ name: 'Thor', profession: 'God', age: 93800 }, true), true);
        assert.strictEqual(Schema.exclusive(), false);
    });

    it('should be able to detect a foreign property locally', () => {

        const sch = new Schema({
            name: 'string',
            profession: 'string',
            age: 'integer'
        });

        assert.throws(
            () => sch.validate({ name: 'Loki', profession: 'trickster', age: 99845, trick: 'neat one' }, true),
            (err) => {
                return err.message.indexOf('xclusive') >= 0;
            }
        );
    });

    it('should be able to detect a foreign property on complex type locally', () => {


        const sch = new Schema({
            person: {
                type: 'object',
                '*': {
                    name: 'string',
                    profession: 'string',
                    age: 'integer'
                }
            }
        });

        assert.throws(
            () => sch.validate({
                person: {
                    name: 'Loki',
                    profession: 'trickster',
                    age: 99845,
                    trick: 'neat one'
                }
            }, true),
            (err) => {
                return err.message.indexOf('xclusive') >= 0;
            }
        );
    });

    it('should be able to detect a foreign property on an array', () => {
        const sch = new Schema({
            person: {
                type: 'object',
                '*': {
                    name: 'string',
                    profession: 'string',
                    age: 'integer',
                    friends: {
                        type: 'array',
                        '*': {
                            type: 'object',
                            '*': {
                                name: 'string'
                            }
                        }
                    }
                }
            }
        });

        assert.throws(
            () => sch.validate({
                person: {
                    name: 'Jack Sparrow',
                    profession: 'pirate',
                    age: 60,
                    friends: [
                        { name: 'Barbossa' },
                        { name: 'Blackbeard' },
                        { name: 'Davy Jones', enemy: true },
                        { name: 'Will Turner' }
                    ]
                }
            }, true),
            (err) => {
                return err.message.indexOf('xclusive') >= 0;
            }
        );
    });

    it('should be able to override the global exclusive mode in instance as false', () => {
        const initial = Schema.exclusive();
        Schema.exclusive(true);
        let sch = new Schema({ name: 'string' });
        assert.equal(sch.validate({ name: 'Kurt Cobain', profession: 'actor' }, false), true);
        Schema.exclusive(initial);
    });

    it('should be able to override the global exclusive mode in instance as true', () => {
        const initial = Schema.exclusive();
        Schema.exclusive(false);
        let sch = new Schema({ name: 'string' });
        assert.throws(
            () => sch.validate({ name: 'Kurt Cobain', profession: 'actor' }, true),
            (err) => {
                Schema.exclusive(initial);
                return err instanceof Error;
            }
        );
    });
});
