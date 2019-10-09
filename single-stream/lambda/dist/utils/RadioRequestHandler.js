'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class RadioRequestHandler {
    static builder() {
        return new RadioRequestHandlerBuilder();
    }
    constructor(builder) {
        this.handlers = builder.handlers;
    }
    async canHandle(handlerInput) {
        const targetHandlerName = (handlerInput.requestEnvelope.request.type === 'IntentRequest')
            ? handlerInput.requestEnvelope.request.intent.name
            : handlerInput.requestEnvelope.request.type;
        return Object.prototype.hasOwnProperty.call(this.handlers, targetHandlerName);
    }
    handle(handlerInput) {
        const targetHandlerName = (handlerInput.requestEnvelope.request.type === 'IntentRequest')
            ? handlerInput.requestEnvelope.request.intent.name
            : handlerInput.requestEnvelope.request.type;
        return this.handlers[targetHandlerName](handlerInput);
    }
}
exports.RadioRequestHandler = RadioRequestHandler;
class RadioRequestHandlerBuilder {
    constructor() {
        this._handlers = {};
    }
    get handlers() {
        return this._handlers;
    }
    withHandlers(handlers) {
        this._handlers = Object.assign({}, this._handlers, handlers);
        return this;
    }
    build() {
        return new RadioRequestHandler(this);
    }
}
exports.RadioRequestHandlerBuilder = RadioRequestHandlerBuilder;
//# sourceMappingURL=RadioRequestHandler.js.map