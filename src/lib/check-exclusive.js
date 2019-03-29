/*
 * There cannot be in payload some member that is not defined in def
 */

const isTypeOf = (defProp, type) => defProp.type === type || defProp === type;

const checkExclusive = function (def, payload, pos) {
    pos = pos || '@';
    let msg = false;

    // it will return false if everything is ok
    // or a message to signal a property that is not defined in schema

    Object.keys(payload).some(prop => {
        if (def[prop] === undefined) {
            msg = pos + '.' + prop + ' should not exist in exclusive mode';
            return true;    // stop iterating
        }

        // if (!def[prop]['*']) {
        //     return false;
        // }

        // if (!def[prop]['*']['*']) {
        //     return false;
        // }

        // if (isTypeOf(def[prop]['*'], 'array')) {
        //     // the array is homogenous
        //     payload[prop].some((element, idx) => {
        //         msg = checkExclusive(def[prop]['*']['*'], element, pos + '.' + prop + '.' + idx);
        //         return !!msg;
        //     });
            
        // } else if (isTypeOf(def[prop]['*'], 'object')) {
        //     // the object is not homogenous
        //     msg = checkExclusive(def[prop]['*']['*'], payload[prop], pos + '.' + prop);
        // } else if (isTypeOf(def[prop]['*'], 'dictionary')) {
        //     Object.keys(payload[prop]).some(key => {
        //         msg = checkExclusive(def[prop]['*']['*'], payload[prop][key], pos + '.' + key);
        //     });
        // }

        // return !!msg;

        let nDef = def[prop];
        if (typeof nDef === 'string') {
            nDef = { type: 'string' };
        }

        if (payload[prop] && def[prop]['*']) {
            if (def[prop].type === 'array') {
                // we have an array
                if (def[prop]['*']['*']) {
                    payload[prop].some((element, idx) => {
                        msg = checkExclusive(def[prop]['*']['*'], element, pos + '.' + prop + '.' + idx);
                        return !!msg;
                    });
                }
            } else if (def[prop].type === 'dictionary') {
                // we have a dictionary
                if (def[prop]['*']['*']) {
                    Object.keys(payload[prop]).some(key => {
                        msg = checkExclusive(def[prop]['*']['*'], payload[prop][key], pos + '.' + prop + '.' + key);
                        return !!msg;
                    });
                }
            } else {
                msg = checkExclusive(def[prop]['*'], payload[prop], pos + '.' + prop);
                return !!msg;
            }
        }

        return false;   // iterate further
    });

    return msg;
};

module.exports = checkExclusive;
