/*
 * There cannot be in payload some member that is not defined in def
 */

const checkExclusive = function (def, pay, pos) {

    pos = pos || '@base';

    let msg = false;

    Object.keys(pay).some(prop => {
        if (def[prop] === undefined) {
            msg = pos + '.' + prop + ' is not defined in exclusive definition';
            return true;    // stop iterating
        }

        if (pay[prop] && def[prop]['*']) {
            if (Array.isArray(pay[prop])) {
                // we have an array
                pay[prop].some((element, idx) => {
                    msg = checkExclusive(def[prop]['*'], element, pos + '.' + idx + '.' + prop);
                    return !!msg;
                });
            } else {
                Object.keys(pay[prop]).some(element => {
                    msg = checkExclusive(def[prop]['*'], element, pos + '.' + prop);
                    return !!msg;
                });
            }
        }

        return false;   // iterate further
    });

    return msg;
};

module.exports = checkExclusive;
