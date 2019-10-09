'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ask_sdk_1 = require("ask-sdk");
const Constants_1 = require("./Constants");
const AudioAssets_1 = require("./AudioAssets");
const AudioController_1 = require("./AudioController");
const I18N_1 = require("./utils/I18N");
class Util {
    /*
     Returns true if we should play the jingle for that user.
     Rule is we play the jingle once per rolling period of 24hours.
    
     This function relies on a DDB table to keep track of last played time per user.
     It silently fails if the table does not exist of if there is a permission issue.
    
     The table definition is
     aws dynamodb describe-table --table-name my_radio
    {
        "Table": {
            "TableArn": "arn:aws:dynamodb:us-east-1:<YOUR ACCOUNT ID>:table/my_radio",
            "AttributeDefinitions": [
                {
                    "AttributeName": "userId",
                    "AttributeType": "S"
                }
            ],
            "ProvisionedThroughput": {
                "NumberOfDecreasesToday": 0,
                "WriteCapacityUnits": 5,
                "ReadCapacityUnits": 5
            },
            "TableSizeBytes": 0,
            "TableName": "my_radio",
            "TableStatus": "ACTIVE",
            "KeySchema": [
                {
                    "KeyType": "HASH",
                    "AttributeName": "userId"
                }
            ],
            "ItemCount": 0,
            "CreationDateTime": 1513766788.6
        }
    }
    
     At runtime, the code needs the following IAM policy attached to the lambda role.
    
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "sid123",
                "Effect": "Allow",
                "Action": [
                    "dynamodb:PutItem",
                    "dynamodb:GetItem",
                    "dynamodb:UpdateItem"
                ],
                "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/my_radio"
            }
        ]
    }
    
    */
    static async shouldPlayJingle(handlerInput) {
        let WILL_PLAY_JINGLE = false;
        // is a jingle defined for this locale ?
        if (AudioAssets_1.audioData(handlerInput.requestEnvelope.request).startJingle === undefined) {
            return WILL_PLAY_JINGLE;
        }
        let attributes = await handlerInput.attributesManager.getPersistentAttributes();
        // Check if user is invoking the skill the first time and initialize preset values
        if (attributes === undefined || Object.keys(attributes).length === 0) {
            attributes = {
                lastPlayed: 0,
                playedCount: 0
            };
            handlerInput.attributesManager.setPersistentAttributes(attributes);
        }
        let lastPlayedEPOCH = attributes.lastPlayed;
        let now = Math.round(new Date().getTime());
        // When last played is more that playOnceEvery ago, agree to play the jingle
        WILL_PLAY_JINGLE = (lastPlayedEPOCH === 0) || (lastPlayedEPOCH + Constants_1.Constants.jingle.playOnceEvery < now);
        // console.log("lastPlayedEPOCH : " + lastPlayedEPOCH);
        // console.log("playOnceEvery   : " + constants.jingle.playOnceEvery);
        // console.log("now             : " + now);
        // console.log("last + every    : " + (lastPlayedEPOCH + constants.jingle.playOnceEvery));
        // console.log("WILL PLAY       : " + WILL_PLAY_JINGLE);
        if (WILL_PLAY_JINGLE) {
            // update the DB
            // console.log("We will play the jingle, let's update the DB to remember that");
            attributes.lastPlayed = now;
            attributes.playedCount = attributes.playedCount + 1;
            handlerInput.attributesManager.savePersistentAttributes();
        }
        ;
        return WILL_PLAY_JINGLE;
    }
}
exports.IntentHandler = {
    // launch request and play intent have the same handler
    'LaunchRequest': async function (input) {
        return this['PlayAudio'](input);
    },
    'PlayAudio': async function (input) {
        const request = input.requestEnvelope.request;
        //is the jingle URL defined ?
        if (AudioAssets_1.audioData(request).startJingle) {
            //should we play the jingle ?
            return Util.shouldPlayJingle(input).then(shouldPlayJingleResult => {
                // play a jingle first, then the live stream or play the live stream
                // depending on return value from shouldPlayJingle()
                // (live stream will be started when we will receive Playback Nearly Finished event)
                return Promise.resolve(AudioController_1.audio.play(shouldPlayJingleResult ? AudioAssets_1.audioData(request).startJingle : AudioAssets_1.audioData(request).url, 0, I18N_1.i18n.S(request, 'WELCOME_MSG', AudioAssets_1.audioData(request).card.title), AudioAssets_1.audioData(request).card));
            });
        }
        else {
            // play the radio directly
            return Promise.resolve(AudioController_1.audio.play(AudioAssets_1.audioData(request).url, 0, I18N_1.i18n.S(request, 'WELCOME_MSG', AudioAssets_1.audioData(request).card.title), AudioAssets_1.audioData(request).card));
        }
    },
    'AMAZON.HelpIntent': async function (input) {
        const request = input.requestEnvelope.request;
        return ask_sdk_1.ResponseFactory.init()
            .speak(I18N_1.i18n.S(request, "HELP_MSG", AudioAssets_1.audioData(request).card.title))
            .withShouldEndSession(false)
            .getResponse();
    },
    'SessionEndedRequest': async function (input) {
        // No session ended logic
        // do not return a response, as per https://developer.amazon.com/docs/custom-skills/handle-requests-sent-by-alexa.html#sessionendedrequest
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    'System.ExceptionEncountered': async function (input) {
        console.log("\n******************* EXCEPTION **********************");
        console.log("\n" + JSON.stringify(input.requestEnvelope, null, 2));
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    'Unhandled': async function (input) {
        input.responseBuilder.speak(I18N_1.i18n.S(input.requestEnvelope.request, 'UNHANDLED_MSG'));
        return Promise.resolve(input.responseBuilder.withShouldEndSession(true).getResponse());
    },
    'AMAZON.NextIntent': async function (input) {
        input.responseBuilder.speak(I18N_1.i18n.S(input.requestEnvelope.request, 'CAN_NOT_SKIP_MSG'));
        return Promise.resolve(input.responseBuilder.withShouldEndSession(true).getResponse());
    },
    'AMAZON.PreviousIntent': async function (input) {
        input.responseBuilder.speak(I18N_1.i18n.S(input.requestEnvelope.request, 'CAN_NOT_SKIP_MSG'));
        return Promise.resolve(input.responseBuilder.withShouldEndSession(true).getResponse());
    },
    'AMAZON.PauseIntent': async function (input) {
        return this['AMAZON.StopIntent'](input);
    },
    'AMAZON.CancelIntent': async function (input) {
        return this['AMAZON.StopIntent'](input);
    },
    'AMAZON.StopIntent': async function (input) {
        return Promise.resolve(AudioController_1.audio.stop(I18N_1.i18n.S(input.requestEnvelope.request, 'STOP_MSG')));
    },
    'AMAZON.ResumeIntent': async function (input) {
        const request = input.requestEnvelope.request;
        const msg = I18N_1.i18n.S(request, 'RESUME_MSG', AudioAssets_1.audioData(request).card.title);
        return Promise.resolve(AudioController_1.audio.play(AudioAssets_1.audioData(request).url, 0, msg, AudioAssets_1.audioData(request).card));
    },
    'AMAZON.LoopOnIntent': async function (input) {
        return this['AMAZON.StartOverIntent'](input);
    },
    'AMAZON.LoopOffIntent': async function (input) {
        return this['AMAZON.StartOverIntent'](input);
    },
    'AMAZON.ShuffleOnIntent': async function (input) {
        return this['AMAZON.StartOverIntent'](input);
    },
    'AMAZON.ShuffleOffIntent': async function (input) {
        return this['AMAZON.StartOverIntent'](input);
    },
    'AMAZON.StartOverIntent': async function (input) {
        input.responseBuilder.speak(I18N_1.i18n.S(input.requestEnvelope.request, 'NOT_POSSIBLE_MSG'));
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    /*
     *  All Requests are received using a Remote Control.
     *  https://developer.amazon.com/docs/custom-skills/playback-controller-interface-reference.html#requests
     */
    'PlaybackController.PlayCommandIssued': async function (input) {
        const request = input.requestEnvelope.request;
        return Promise.resolve(AudioController_1.audio.play(AudioAssets_1.audioData(request).url, 0, null, null));
    },
    'PlaybackController.NextCommandIssued': async function (input) {
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    'PlaybackController.PreviousCommandIssued': async function (input) {
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    'PlaybackController.PauseCommandIssued': async function (input) {
        return Promise.resolve(AudioController_1.audio.stop(null));
    }
};
//# sourceMappingURL=IntentHandlers.js.map