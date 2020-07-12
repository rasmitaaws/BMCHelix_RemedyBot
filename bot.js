// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    
    ActionTypes} = require('botbuilder');

   
    var _=require('underscore');
 
const TextEncoder = require('util').TextEncoder;
const RestaurantCard = require('./resources/adaptiveCards/Restaurantcard.json');
const CARDS = [

    RestaurantCard
];


const { CreateIncidentDialogue } = require('./CreateIncidentDialogue.js')
const {UpdateIncidentDialog }= require('./updateIncidentWorklog')
var updateIncident=require('./graphClient');

var updateRemedyWorklog=require('./bmcHelixClient')
// Welcomed User property name
const WELCOMED_USER = 'welcomedUserProperty';
const CONVERSATION_DATA_PROPERTY= 'dialogState';
class TeamsConversationBot extends TeamsActivityHandler {
    constructor(userState,conversationState) {
        super();

      
    this.conversationState = conversationState;
    this.userState = userState;
    this.dialogState =  this.conversationState.createProperty(CONVERSATION_DATA_PROPERTY);
    this.conversationData = conversationState.createProperty('conservationData');
      
    this.previousIntent = this.conversationState.createProperty("previousIntent");
    
    this.createIncidentDialogue = new CreateIncidentDialogue(this.conversationState,this.userState);

    this.updateIncidentDialog = new UpdateIncidentDialog(this.conversationState,this.userState);
   
        

    
         // Creates a new user property accessor.
    // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
    this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);
 
    

   

    
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);
       
            if (didBotWelcomedUser === false) {
                // The channel should send the user name in the 'From' object
                const userName = context.activity.from.name;
                
                await this.sendSuggestedActions(context);
                // Set the flag indicating the bot handled the user's first message.
                await this.welcomedUserProperty.set(context, true);
            } else {
                // This example uses an exact match on user's input utterance.
                // Consider using LUIS or QnA for Natural Language Processing.
                await this.dispatchToIntentAsync(context);
        
                }
           
      
            await next();
        });


    this.onDialog(async (context, next) => {
        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
        await next();
    }); 
        // Sends welcome messages to conversation members when they join the conversation.
// Messages are only sent to conversation members who aren't the bot.
this.onMembersAdded(async (context, next) => {
    // Iterate over all new members added to the conversation
    for (const idx in context.activity.membersAdded) {
        // Greet anyone that was not the target (recipient) of this message.
        // Since the bot is the recipient for events from the channel,
        // context.activity.membersAdded === context.activity.recipient.Id indicates the
        // bot was added to the conversation, and the opposite indicates this is a user.
        if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
           await this.sendWelcomeMessageOnMembersAdded(context);
        }
    }

    // By calling next() you ensure that the next BotHandler is run.
    await next();
});
      
    }

    async run(context) {
        await super.run(context);
    
        // Save state changes
        await this.userState.saveChanges(context);
    }

   

    async dispatchToIntentAsync(context){

        var currentIntent = '';
        const previousIntent = await this.previousIntent.get(context,{});
        
        const conversationData = await this.conversationData.get(context,{}); 
        
        const modifiedText = TurnContext.removeMentionText(context.activity, context.activity.recipient.id);
        if(previousIntent.intentName && conversationData.endDialog === false )
        {
           currentIntent = previousIntent.intentName;

        }
        else if (previousIntent.intentName && conversationData.endDialog === true)
        {
             currentIntent = modifiedText;

        }
        else
        {
            currentIntent = modifiedText;
            await this.previousIntent.set(context,{intentName: modifiedText});

        }

       
    switch(currentIntent)
    {
       
        case 'Create Incident':
        console.log("Inside Make Reservation Case");
   
        await this.conversationData.set(context,{endDialog: false});
        await this.createIncidentDialogue.run(context,this.dialogState);
        conversationData.endDialog = await this.createIncidentDialogue.isDialogComplete();
        if(conversationData.endDialog)
        {
            await this.sendSuggestedActionsinEndDialogue(context);

        }
        
        break;

        case 'Update Incident':
            console.log("Update Incident");
         
            await this.conversationData.set(context,{endDialog: false});
            await this.updateIncidentDialog.run(context,this.dialogState);
            conversationData.endDialog = await this.updateIncidentDialog.isDialogComplete();
            if(conversationData.endDialog)
            {   
                await this.previousIntent.set(context,{intentName: null});
                await this.sendSuggestedActions(context);
    
            }
            
            break;



        default:
              // The channel should send the user name in the 'From' object
              await this.sendWelcomeMessageOnMembersAdded(context);

            break;
    }


    }

 

    async sendWelcomeMessage(turnContext) {
        const { activity } = turnContext;

   
                const welcomeMessage = `Welcome to BmcHelix Bot ${ activity.from.name }. `;
                await turnContext.sendActivity(welcomeMessage);
                await this.sendSuggestedActions(turnContext);
            
        
    }

    async sendWelcomeMessageOnMembersAdded(turnContext) {
        const { activity } = turnContext;

        // Iterate over all new members added to the conversation.
        for (const idx in activity.membersAdded) {
            if (activity.membersAdded[idx].id !== activity.recipient.id) {
                const welcomeMessage = `Welcome to BmcHelix  Bot ${ activity.membersAdded[idx].name }. `;
                await turnContext.sendActivity(welcomeMessage);
                await this.sendSuggestedActions(turnContext);
            }
        }
    }


    async sendSuggestedActions(turnContext) {
       

        
        await turnContext.sendActivity({
            text: 'What would you like to do today ?',
            attachments: [CardFactory.adaptiveCard(CARDS[0])]
        });
    }

    async sendSuggestedActionsinEndDialogue(turnContext) {
        var reply = MessageFactory.suggestedActions(['Update Incident','Check IncidentHistory','Create Incident'],'Please continue further exploring ?');
        await turnContext.sendActivity(reply);
    }



}
module.exports.TeamsConversationBot = TeamsConversationBot;
