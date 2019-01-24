Build status: [![CircleCI](https://circleci.com/gh/alsofronie/psky-schema/tree/master.svg?style=svg)](https://circleci.com/gh/alsofronie/psky-schema/tree/master)

# Object schema validator

This package validates an object definition against the declared types and, optionally, a set of validation rules.

## TODO's & wishlist

 - integrate [JSON-LD](https://json-ld.org/)

## Basic Usage - Validation

As simple as it can be: create a `Schema` object by supplying a schema definition and validate a payload:

```
var schema = new Schema({ name: 'string' });
var validated = schema.validate({ name: 'Montezuma' });
```

The `validate` function will return `true` if everything checks out or will throw an error if something fails.

## General structure for schema definition

The basic definition form contains the name of the variable and the corresponding type:

```
{
    "id": "integer",
    "name": "string"
}
```

Or you can use the extended syntax:

```
{
    "id": {
        "type": "integer"
    },
    "name": {
        "type": :"string"
    }
}
```

 > Note: The above two schema definitions are equivalent, defining a non-required `id` of type integer and a `name` string, also non-required.

However, the extended syntax allows not only type-based validation, but also rule-based validation:

```
{
    "id": {
        "type": "integer",
        "min": 10,
        "max": 15
    },
    "name": {
        "type": "string",
        "required": true
    }
}
```

The rules are applied in the order they appear, with the except of `nullable` rule (see below). If a rule is not satisfied, the code will break at that point and no rules will be further verified.

 > **Warning**: Do not use in keys (like the `id` in the example above) `@` as starting character. Also, do not use `*` as a name, because is also reserved (see below Validating arrays).

## Available types

### Primary types

These types are directly supported by JSON format and they should be received as is. The validator will make a difference between a value `346` and a value `"346"`, the last one failing the `integer` type validation. The primary types are:

 - `integer` - an integer number
 - `string`- a string with variable length
 - `float` - a floating point number
 - `bool` - a boolean value, represented by `true` or `false`
 - `array` - an array
 - `date` - an instance of a Date JS object
 - `number` - an instance of a Number JS object
 - `regex` - an instance of a Regexp JS object
 - `object` - a Javascript object
 ' `function` - a Javascript function

### Derived types

All the derived types are represented as strings or integers, having a hint on their format and domain:

 - `mixed` - any data can be stored in this variable type;
 - `date` - a valid date object;
 - `iso_date` - a string representation of date, in the format `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss`;
 - `iso_date_short` - a string representation of date and time, in the format `YYYY-MM-DD`;
 - `iso_date_long` - a string representation of date and time, in the format `YYYY-MM-DD HH:mm:ss`;
 - `uuid` - The field under validation must be a valid RFC 4122 (version 1, 3, 4, or 5) universally unique identifier (UUID);

 > Warning: a type of `mixed` will not trigger a type validation.

## Available validation rules

The validation rules further enforces the values and the formats of the supplied variable. But **always** the first rule is the `type`. If the type fails, no other rules will be verified. An exception is the `nullable` validation rule, which, if it is present, will be taken into account.

### Minimum rule: `min`

For `int` type, this rule will check if the supplied value is **greater or equal than** the argument supplied in the rule definition, which must be an integer.

For `string` type, the rule refers to the length of the string, being **greater or equal to** the argument supplied in the rule definition, which must be an integer.

For `array`, the rule refers to the length of the array.

For `date` type, the rule applies as **is after** the argument supplied in the rule definition, which must be a date or a value that can correctly be parsed by the `Date` constructor.

### Maximum rule: `max`

This rule is similar with the `min` rule. For example, in the case of the `int` type, the value will be checked to be **less or equal than** the rule argument.

For example, the definition below:

```
{
    "age": {
        "type": "integer",
        "min": 18,
        "max": 65
    }
}
```

will validate a value of `18` to `65`, but a value of `66` will fail validation.

### Exact rule: `exact`

This rule is a shorthand for `min` and `max` when the two values are equal. The following examples are equivalent:

Example with `min` and `max`

```
{
    "age": {
        "type": "integer",
        "min": 22,
        "max": 22
    },
    "basket": {
        "type": "array",
        "min": 10,
        "max": 10
    }
}
```

Equivalent example with `size`
```
{
    "age": {
        "type": "integer",
        "size": 22
    },
    "basket": {
        "type": "array",
        "size": 10
    }
}
```

### Alpha rule: `alpha`

This only refers to `string` type and checks to see if the string contains only letters.

### Alphanumeric rule: `alphanumeric`

This only refers to `string` type and checks to see if the string contains only letters and numbers.

### Digits rule: `digits`

This only refers to `string` type and checks if the string contains only numbers and signs (`+` and `-`)

### In rule: `in`

The `in` rule accepts an array of values with represent the valid domain for the value. The comparison is performed with **type checking** (as in `===` operator). For example, for the rule definition:

```
{
    "price": {
        "type": "float",
        "in": [22.99, 199.49, 3999.49]
    }
}
```

will pass validation for:

```
{
    "price": 199.49
}
```

but will fail for:

```
{
    "price": "199.49"
}
```

### Not In rule: `not_in`

This rule is the negation of `in` rule. The value should **not** be in the provided rule argyment.

### Regexp rule: `regexp`

This rule will check a `string` value for complying with the rule definition supplied argument, which must be a valid regexp, exactly as the one you would supply to `Regexp` Javascript object.

The syntax is:

```
{
    "name": {
        "type": "string",
        "regexp": "^[a-zA-Z0-9\.]+\s[a-zA-Z0-9\.]+*"
    }
}
```

If you also need the flags (like `g`, `i`), the syntax is:

```
{
    "name": {
        "type": "string",
        "regexp": {
            "pattern": "^[a-z0-9\.]+\s[a-z0-9\.]+*$",
            "flags": "im"
        }
    }
}
```

### Required rule: `required`

This rule validates the *presence* of a variable **AND** a non-empty value.

By default, all the rules contains `required` set to false.

### Nullable rule: `nullable`

This rule will permit any variable (of any type) to hold a `null` value. The value must be represented as `null` in JSON, like:

```
{
    "age": null
}
```

 > Note: a value of `"null"` (string) is not null. An empty array is not a null value.

The rule accepts a boolean (`true` or `false`) as argument.

By default, **all variables** have this rule with `false`, so the following definitions are equivalent:

With explicit `nullable`:

```
{
    "file_id": {
        "type": "array",
        "nullable": false
    }
}
```

Without explicit `nullable`, extended syntax:

```
{
    "file_id": {
        "type": "array"
    }
}
```

Without explicit `nullable`, shortened syntax:

```
{
    "file_id": "array"
}
```

So, it makes no sense to set `nullable` to false, but the validator will not complain. Of course, you can specify it to be more exact in your source code :).

The real thing comes with the `nullable` set to `true` in your validation rules. This will always be **the first rule checked**, even before the type. If the value is `null`, the validator will be satisfied. If not, the `type` is checked and, after it passes, all the other validation rules, in the provided order.

A special case is when both `nullable` and `required` are specified with `true` as argument. In this case, the given variable must be non-empty only if it is not null.

## Validating arrays

A special syntax is for validating not only an array to be an array, but also it's values.

For example, we need to validate an array of values representing ages, which can be integers between 18 and 25 and they must be at least 3 elements in array and 10 at most. In this case, the validation will look like this:

```
{
    "ages": {
        "type": "array",
        "min": 3,
        "max": 10,
        "*": {
            "type": "integer",
            "min": 18,
            "max": 26
        }
    }
}
```

## Validating objects

Another special case is for validating an object structure. For example let's presume we need to validate a Javascript object containing a person's information: name, age, sex and occupation. Further more, the name is a required string, the age must be an integer over 18, and the occupation must be a string no more than 255 characters. A description is an optional string (as an example for mixing the shorter with the extended syntax). The rule will look like this:

```
{
    "person": {
        "type": "object",
        "*": {
            "name": {
                "type": "string",
                "required": true
            },
            "age": {
                "type": "integer",
                "min": 18,
            },
            "occupation": {
                "type": "string",
                "max": 255
            },
            "description": "string"
        }
    }
}
```

For validating array of objects (for example, an array of persons), the following syntax is allowed:

```
{
    "persons": {
        "type": "array",
        "*": {
            "type": "object",
            "*": {
                "name": {
                    "type": "string",
                    "required": true
                },
                "age": {
                    "type": "integer",
                    "min": 18,
                },
                "occupation": {
                    "type": "string",
                    "max": 255
                },
                "description": "string"
            }
        }
    }
}
```

There is no limit for this depth. You can easily extend the example above for an array of persons in which every person has instead of a string, an array of occupations (let's say it's an array of UUIDs with a minimum of one occupation:

```
{
    "persons": {
        "type": "array",
        "*": {
            "type": "object",
            "*": {
                "name": {
                    "type": "string",
                    "required": true
                },
                "age": {
                    "type": "integer",
                    "min": 18,
                },
                "occupations": {
                    "type": "array",
                    "min": 1,
                    "*": {
                        "type": "string",s
                    }
                },
                "description": "string"
            }
        }
    }
}
```

Putting it simpler, the `*` character stands for **every element of the array** or **the property of the object**.

 > **Note**: The `*` character will be ignored for non-array and non-object types and **should not be used**.

## Registering new types

Sometimes the defined types are not enough. The `Schema` object allows you to `register` a new type, providing the name and a function for validating the type. The function will receive the `value` and the full `schema` object (so you can use it's built-in functionality). You can register new types in two ways: globally and locally. A global type registration will affect all schema instances, whereas a local schema registration will be specific to that schema object. The locally defined types will take precedence over the global ones. The built-in types are defined globally.

Take this example:

```
var personTypeValidator = function (value) {
    return value && value.name && value.age && parseInt(value.age) === value.age && value.age >= 18;
};
```

The function `personTypeValidator` should return boolean `true` if the type validation passes or `false` otherwise.

To register locally, we can use:

```
var schema = new Schema({ person: '_person' });
schema.register('_person', personTypeValidator);

schema.validate({ person: { name: 'Zamolxe', age: 2144 } });
```

To register globally, we will use:

```
Schema.register('_person', personTypeValidator);

var schema = new Schema({ person: '_person' });
schema.validate({ person: { name: 'Zamolxe', age: 2144 } });
```

Note the call to the `register` function is called on the `Schema` class and not on the `schema` instance.

The validation function also receives a second argument, which is the schema object itself. You can use the `schema` argument provided to use the built-in functions. Let's rewrite function in the example to make use of the built-in schema and further validate the name as `string`, `age` as integer with a minimum required value of `18`. The `schema` argument exposes a `check` function which can be used to validate each property:

```
// ...
var personTypeValidator = function (value, sch) {
    return sch.check(value, {
        type: 'object',
        required: true,
        '*': {
            name: 'string',
            required: true,
            age: {
                type: 'integer',
                required: true,
                min: 18
            }
        }
    });
}
// ...
```

## Extending rules

In an (almost) similar way you can extend the `rules` functionality. The syntax is almost the same, with the notable difference that you will receive in the validation function the full schema definition, also. We will define a `human` rule that will validate **ANY** type (in this case, an `object`).

```
var schema = new Schema({
    human: {
        type: 'object',
        human: true
});

var humanRuleValidator = function (value, definition, schema) {
    return value.hasOwnProperty('name') && value.hasOwnProperty('age');
};

schema.extend('human', humanRuleValidator);

schema.validate({
    person: { name: 'John', age: 33 }
});
```

The *local* and *global* methods are also available for `extend`.

## Exclusive schema

Sometimes we need to validate an object exclusively against a schema, meaning the object must have exactly the properties and methods described and nothing else. As always, there are two options to set exclusive mode, globally or locally.

The global method can be called in three ways: without argument is a getter that returns the current mode and with a boolean (true or false) argument, the method is a **fluent** setter.

```
// Get the currently exclusive mode value (boolean)
const mode = Schema.exclusive();

// Globally set exclusive mode. This method is fluent.
Schema.exclusive(true);

// Globally unset the exclusive mode. This method is fluent.
Schema.exclusive(false);
```

Locally, the exclusive mode is set on validation, for each validation:

```
var schema = new Schema({ name:'string' });
schema.validate({ name: 'Frodo'}, true);
```

If the second argument on the `validate` function is present and boolean, it will override any globally set mode.
