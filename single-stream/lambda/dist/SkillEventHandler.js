'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ask_sdk_core_1 = require("ask-sdk-core");
class SkillEventHandler {
    async canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type.startsWith('AlexaSkillEvent') || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    }
    async handle(handlerInput) {
        return ask_sdk_core_1.ResponseFactory.init()
            .getResponse();
    }
}
exports.SkillEventHandler = SkillEventHandler;
//# sourceMappingURL=SkillEventHandler.js.map