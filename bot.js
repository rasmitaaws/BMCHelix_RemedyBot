// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    ActionTypes} = require('botbuilder');

const TextEncoder = require('util').TextEncoder;

class TeamsConversationBot extends TeamsActivityHandler {
    constructor() {
        super();
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            const modifiedText = TurnContext.removeMentionText(context.activity, context.activity.recipient.id);
            if (modifiedText=='update1') {

                // Send a message with an @Mention
                await context.sendActivity(`Enetr INC nUMBER`);
 
            } else if(modifiedText.startsWith('INC')){
               // Otherwise we send a normal echo
              await context.sendActivity(`You said '${ context.activity.recipient.id}'`);
           }
            await next();
        });

      
    }

}
module.exports.TeamsConversationBot = TeamsConversationBot;
