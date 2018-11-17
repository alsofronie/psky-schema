var deepCopy = require('./lib/deep-copy');
var normalizeDefinition = require('./lib/normalize-definition');

var rex = (value, rule) => {
    if (!rule) {

        throw {
            error: true,
            code: 'invalid',
            type: 'pattern',
            details: '',
            message: 'The regexp rule is not specified',
        };
    }

    value = '' + value;
    var re;
    if (rule.pattern) {
        re = new RegExp(rule.pattern, (rule.flags ? rule.flags : ''));
    } else {
        re = new RegExp(rule);
    }

    return !!re.test(value);
};

var types = {
    'integer': (value) => (value === parseInt(value)),
    'string': (value) => (('' + value) === value),
    'float': (value) => (!Number.isNaN(parseFloat(value)) && value === parseFloat(value)),
    'bool': (value) => (value === true || value === false),
    'array': (value) => Array.isArray(value),
    'object': (value) => (value !== null && (!Array.isArray(value) && typeof value === 'object')),
    'mixed': () => true,
    'date': (value) => (value && value instanceof Date),
    'number': (value) => (value && value instanceof Number),
    'regexp': (value) => (value && value instanceof RegExp),
    'iso_date': (value) => (types.iso_date_short(value) || types.iso_date_long(value)),
    'iso_date_short': (value) => {
        if (!rex(value, '^[0-9]{4}-[0-1][0-9]-[0-3][0-9]$')) {
            return false;
        }
        var d = new Date(value);

        if (Number.isNaN(d.getTime())) {
            return false;
        }

        return d.toISOString().slice(0, 10) === value;
    },
    'iso_date_long': (value) => {
        if (!rex(value, '^[0-9]{4}-[0-1][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$')) {
            return false;
        }

        var d = new Date(value.replace(' ', 'T') + '.000Z');
        if (Number.isNaN(d.getTime())) {
            return false;
        }

        return d.toISOString().slice(0, 19).replace('T', ' ') === value;
    },
    'uuid': (value) => rex(value, '/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'),
};

var rules = {
    'regexp': (value, definition) => (this.types['string'](value) && rex(value, definition['regexp'])),
    'min': (value, definition) => (value >= definition.min),
    'min:object': () => false,
    'min:string': (value, definition) => (value.length >= definition.min),
    'min:array': (value, definition) => (value.length >= definition.min),
    'min:date': (value, definition) => (value.valueOf() >= new Date(definition.min).valueOf()),
    'min:number': (value, definition) => (value.valueOf >= new Number(definition.min).valueOf()),
    'min:regex': () => false,
    'max': (value, definition) => (value <= definition.max),
    'max:object': () => false,
    'max:string': (value, definition) => (value.length <= definition.max),
    'max:array': (value, definition) => (value.length <= definition.max),
    'max:date': (value, definition) => (value.valueOf() <= new Date(definition.max).valueOf()),
    'max:number': (value, definition) => (value.valueOf() <= new Number(definition.max).valueOf()),
    'max:regexp': () => false,
    'exact': (value, definition) => (value === definition.exact),
    'exact:object': () => false,
    'exact:string': (value, definition) => (value.length === definition.exact),
    'exact:array': (value, definition) => (value.length === definition.exact),
    'exact:date': (value, definition) => ((new Date(value)).valueOf() === new Date(definition.exact).valueOf()),
    'exact:number': (value, definition) => ((new Number(value)).valueOf() === new Number(definition.exact).valueOf()),
    'exact:regexp': () => false,
    'alpha': (value, definition) => (definition.alpha ? rex(value, '^[a-zA-Z ]+$') : rex(value, '^[^a-zA-Z ]+$')),
    'alphanumeric': (value, definition) => (definition.alphanumeric ? rex(value, '^[a-zA-Z0-9- ]+$') : rex(value, '^[^a-zA-Z0-9- ]+$')),
    'digits': (value, definition) => (definition.digits ? rex(value, '^[0-9+-]+$') : rex(value, '^[^0-9+-]+$')),
    'in': (value, definition) => (definition.in.indexOf(value) >= 0),
    'in:array': (value, definition) => (!value.find(v => definition.in.indexOf(v) < 0)),
    'not_in': (value, definition) => (definition.not_in.indexOf(value) < 0),
    'not_in:array': (value, definition) => (!value.find(v => definition.not_in.indexOf(v) >= 0)),
    'required': (value) => (value !== undefined),
    // 'required:bool': (value) => (value === true || value === false),
    // 'required:array': (value) => (value && value.length > 0),
    // 'required:object': (value) => (value && Object.keys(value).length > 0),

    '*': () => false,
    '*:array': (value, definition, sch) => (value.forEach((v, i) => sch.check(v, definition['*'], definition['@key'] + '.' + i)) || true),
    '*:object': (value, definition, sch) => (Object.keys(definition['*']).forEach(r => sch.check(value[r], definition['*'][r], definition['@key'] + '.' + r)) || true),
};

var casts = {
    'integer': (value) => (parseInt(value)),
    'float': (value) => (parseFloat(value)),
    'bool': (value) => (!!value),
    'string': (value) => ('' + value),
};

var packers = {

};

/**
 * The main schema object
 * 
 * @param {object} definition The definition
 */
var Schema = function (definition) {
    var def = deepCopy(definition || {});

    var localTypes = {};
    var localRules = {};
    var localPackers = {};

    /**
     * Helper function
     * 
     * @param {string} type The type
     */
    function getTypeValidator(type) {
        return (localTypes[type] ? localTypes[type] : (types[type] ? types[type] : null));
    }

    /**
     * The rule:type takes precedence. The instance rules takes precedence.
     *
     * @param {string} type 
     * @param {string} rule 
     */
    function getRuleValidator(type, rule) {
        var cpx = rule + ':' + type;
        return (localRules[cpx] ? localRules[cpx] : (localRules[rule] ? localRules[rule] : (rules[cpx] ? rules[cpx] : (rules[rule] ? rules[rule] : null))));
    }

    /**
     * Helper function for preparing a value for serialization
     * 
     * @param {mixed} value The value
     * @param {object} definition The full definition
     * @param {bool} sense True for packing, false for unpacking
     */
    function prepare(value, definition, sense) {

        if (packers[definition.type]) {
            return packers[definition.type](value);
        }

        if (casts[definition.type]) {
            return casts[definition.type](value);
        }

        // treat separately for built-in objects
        if (definition.type === 'date') {
            return (sense ? value.valueOf() : new Date(value));
        } else if (definition.type === 'number') {
            return sense ? value.valueOf() : new Number(value);
        } else if (definition.type === 'regexp') {
            if (sense) {
                return {
                    p: value.source,
                    f: (value.global ? 'g' : '') + (value.ignoreCase ? 'i' : '') + (value.multiline ? 'm' : '')
                };
            } else {
                return new RegExp(value.p, value.f);
            }
        }

        if (definition.type === 'array') {
            if (definition['*'] && Array.isArray(value)) {
                var packed = [];
                value.forEach(val => {
                    packed.push(this.prepare(val, definition['*']));
                });
                return packed;
            }
        } else if (definition.type === 'object') {
            packed = {};
            if (definition['*'] && typeof value === 'object') {
                Object.keys(value).forEach(key => {
                    packed[key] = this.prepare(value[key], definition['*']);
                });
                return packed;
            }
        }

        return deepCopy(value);
    }

    /**
     * Register a new type, together with a validator and a packer function
     */
    this.register = function (type, validator, packer) {
        localTypes[type] = validator;
        localPackers[type] = packer;
    };

    /**
     * Adds a custom rule
     */
    this.extend = function (rule, validator) {
        localRules[rule] = validator;
    };

    /**
     * Checks a value if validates against the type and various rules.
     * Exposed in object so custom rules / types will be able to use it
     */
    this.check = function (value, definition, key) {
        key = key || '@base';
        var def = normalizeDefinition(definition, key);
        var type = def.type;

        var typeValidator = getTypeValidator(type);

        if (!typeValidator) {
            throw {
                error: true,
                code: 'unknown:type',
                type: type,
                details: key,
                message: 'Unknown type: ' + type + ' for ' + key,
            };
        }

        // Nullable processing first
        if (def.nullable === true && value === null) {
            return true;
        }

        // Required processing next
        var ruleRequired = getRuleValidator(type, 'required');
        if (def.required && ruleRequired(value, def, this) !== true) {
            throw {
                error: true,
                code: 'validation',
                type: 'required',
                details: key,
                message: 'Required ' + key,
            };
        } else if (!def.required && value === undefined) {
            return true;
        }

        if (!typeValidator(value, this)) {
            throw {
                error: true,
                code: 'validation',
                type: type,
                details: key,
                message: value + ' is not ' + type + ' for ' + key,
            };
        }

        Object.keys(def).forEach(chk => {
            // We already checked these things 
            if (['type', '@key', 'nullable', 'required'].indexOf(chk) < 0) {
                var rule = getRuleValidator(type, chk);

                if (!rule) {
                    throw {
                        error: true,
                        code: 'unknown:rule',
                        type: chk,
                        details: key,
                        message: 'Unknown rule ' + rule + ' for ' + key
                    };
                }

                if (rule(value, def, this) !== true) {
                    throw {
                        error: true,
                        code: 'validation',
                        type: chk,
                        details: key,
                        message: 'Invalid value at rule ' + chk + ' (' + chk + ':' + type + ') for ' + key
                    };
                }
            }
        });

        return true;
    };

    /**
     * Main validation function
     */
    this.validate = function (payload) {
        if (!def) {
            throw {
                error: true,
                code: 'empty',
                type: 'definition',
                details: '',
                message: 'Invalid or empty definition',
            };
        }

        Object.keys(def).forEach(field => this.check(payload[field], def[field], field));
        return true;
    };

    /**
     * Packer function
     */
    this.pack = function (payload) {
        var cloned = {};
        var definition = normalizeDefinition(def, '@pack');

        Object.keys(def).forEach(field => {
            if (payload[field] === undefined) {
                return;
            }
            cloned[field] = prepare(payload[field], definition[field], true);
        });

        return JSON.stringify(cloned);
    };

    /**
     * Unpacker function
     */
    this.unpack = function (packed) {
        var value = JSON.parse(packed);

        var definition = normalizeDefinition(def, '@pack');

        var cloned = {};

        Object.keys(definition).forEach(field => {
            if (value[field] === undefined) {
                return;
            }
            cloned[field] = prepare(value[field], definition[field], false);
        });

        return cloned;
    };

    this.getRegisteredTypes = function () {
        return Object.keys(localTypes);
    };

    this.getRegisteredRules = function () {
        return Object.keys(localRules);
    };

    this.getRegisteredPackers = function () {
        return Object.keys(packers);
    };
};

/**
 * Static function for registering a new type globally
 */
Schema.register = function (type, validator, packer) {
    types[type] = validator;
    packers[type] = packer;
};

/**
 * Static function for extending the rules globally
 */
Schema.extend = function (rule, validator) {
    rules[rule] = validator;
};

module.exports = Schema;
