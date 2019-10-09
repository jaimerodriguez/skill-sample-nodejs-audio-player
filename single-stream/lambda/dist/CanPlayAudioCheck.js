'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const I18N_1 = require("./utils/I18N");
exports.CheckAudioInterfaceHandler = {
    canHandle(handlerInput) {
        let result = false;
        try {
            result = (handlerInput.requestEnvelope.context.System.device.supportedInterfaces.AudioPlayer === undefined);
        }
        catch (e) {
            // system.device or system.device.supportedInterfaces is undefined.
            // this happens when the skill receives audio player event or skill lifecycle events 
        }
        return result;
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(I18N_1.i18n.S(handlerInput.requestEnvelope.request, "DEVICE_NOT_SUPPORTED"))
            .withShouldEndSession(true)
            .getResponse();
    },
};
//# sourceMappingURL=CanPlayAudioCheck.js.map