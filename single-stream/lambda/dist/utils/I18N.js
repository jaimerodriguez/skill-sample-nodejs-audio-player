'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Strings_1 = require("../Strings");
class I18N {
    constructor(strings) {
        this.strings = strings;
    }
    isCustomerRequest(request) {
        return request.locale !== undefined;
    }
    S(request, key, ...args) {
        let result;
        if (this.isCustomerRequest(request)) {
            try {
                result = this.strings[request.locale][key];
                if (result === undefined) {
                    result = `No string defined for key : ${key}`;
                }
                // search for {x} and replaces with values
                const regex = /({\d*})/g;
                result = result.replace(regex, (match, p1, offset, string) => {
                    const index = parseInt((match.substring(1, match.length)).substring(0, match.length - 2));
                    return args[index];
                });
            }
            catch (e) {
                console.log(e);
                console.log(`Can not find strings for locale ${request.locale} and key ${key}`);
            }
        }
        else {
            throw new Error(`Unsupported request type for localisation : ${request.type}`);
        }
        return result;
    }
}
exports.i18n = new I18N(Strings_1.strings);
//# sourceMappingURL=I18N.js.map