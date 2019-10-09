'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = __importStar(require("aws-sdk"));
const ask_sdk_1 = require("ask-sdk");
const IntentHandlers_1 = require("./IntentHandlers");
const AudioHandlers_1 = require("./AudioHandlers");
const RadioRequestHandler_1 = require("./utils/RadioRequestHandler");
const SkillEventHandler_1 = require("./SkillEventHandler");
const CanPlayAudioCheck_1 = require("./CanPlayAudioCheck");
const Constants_1 = require("./Constants");
async function handler(event, context, callback) {
    const factory = ask_sdk_1.SkillBuilders.standard()
        .addRequestHandlers(CanPlayAudioCheck_1.CheckAudioInterfaceHandler, new SkillEventHandler_1.SkillEventHandler(), RadioRequestHandler_1.RadioRequestHandler.builder()
        .withHandlers(IntentHandlers_1.IntentHandler)
        .withHandlers(AudioHandlers_1.AudioHandler)
        .build())
        .withAutoCreateTable(true)
        .withTableName(Constants_1.Constants.jingle.databaseTable);
    if (Constants_1.Constants.useLocalDB) {
        const ddbClient = new AWS.DynamoDB({
            endpoint: 'http://localhost:8000'
        });
        factory.withDynamoDbClient(ddbClient);
    }
    const skill = factory.create();
    try {
        if (Constants_1.Constants.debug) {
            console.log("\n" + "******************* REQUEST  **********************");
            console.log(JSON.stringify(event, null, 2));
        }
        const responseEnvelope = await skill.invoke(event, context);
        if (Constants_1.Constants.debug) {
            console.log("\n" + "******************* RESPONSE  **********************");
            console.log(JSON.stringify(responseEnvelope, null, 2));
        }
        return callback(null, responseEnvelope);
    }
    catch (error) {
        if (Constants_1.Constants.debug) {
            console.log(JSON.stringify(error, null, 2));
        }
        return callback(error);
    }
}
exports.handler = handler;
//# sourceMappingURL=index.js.map