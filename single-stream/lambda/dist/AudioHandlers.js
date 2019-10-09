'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const AudioController_1 = require("./AudioController");
const AudioAssets_1 = require("./AudioAssets");
exports.AudioHandler = {
    'AudioPlayer.PlaybackStarted': async function (input) {
        /*
         * AudioPlayer.PlaybackStarted Directive received.
         * Confirming that requested audio file began playing.
         * Do not send any specific response.
         */
        console.log("Playback started");
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    'AudioPlayer.PlaybackFinished': async function (input) {
        /*
         * AudioPlayer.PlaybackFinished Directive received.
         * Confirming that audio file completed playing.
         * Do not send any specific response.
         */
        console.log("Playback finished");
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    'AudioPlayer.PlaybackStopped': async function (input) {
        /*
         * AudioPlayer.PlaybackStopped Directive received.
         * Confirming that audio file stopped playing.
         */
        console.log("Playback stopped");
        //do not return a response, as per https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#playbackstopped
        return Promise.resolve(input.responseBuilder.getResponse());
    },
    'AudioPlayer.PlaybackNearlyFinished': async function (input) {
        /*
         * AudioPlayer.PlaybackNearlyFinished Directive received.
         * Replacing queue with the URL again.
         * This should not happen on live streams
         */
        console.log("Playback nearly finished");
        const request = input.requestEnvelope.request;
        return Promise.resolve(AudioController_1.audio.playLater(AudioAssets_1.audioData(request).url, AudioAssets_1.audioData(request).card));
    },
    'AudioPlayer.PlaybackFailed': async function (input) {
        /*
         * AudioPlayer.PlaybackFailed Directive received.
         * Logging the error and restarting playing with no output speach
         */
        const request = input.requestEnvelope.request;
        console.log("Playback Failed : " + JSON.stringify(request.error, null, 2));
        return Promise.resolve(AudioController_1.audio.play(AudioAssets_1.audioData(request).url, 0, null, null));
    }
};
//# sourceMappingURL=AudioHandlers.js.map