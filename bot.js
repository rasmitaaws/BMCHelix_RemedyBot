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

              
       
            if(context.activity.channelId==='msteams')
        {
            const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);
           
               // (and only the first time) a user initiates a personal chat with your bot.
               if (didBotWelcomedUser === false) {
                // The channel should send the user name in the 'From' object
                await this.sendWelcomeMessageOnMembersAdded(context);

    

                // Set the flag indicating the bot handled the user's first message.
                await this.welcomedUserProperty.set(context, true);
            } 
        }else {
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

    async sendIntroCard(context) {
        const card = CardFactory.heroCard(
            'Welcome to Bot Framework!',
            'Welcome to Welcome Users bot sample! This Introduction card is a great way to introduce your Bot to the user and suggest some things to get them started. We use this opportunity to recommend a few next steps for learning more creating and deploying bots.',
            ['https://aka.ms/bf-welcome-card-image'],
            [
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Get an overview',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Create Incident',
                    value: 'https://stackoverflow.com/questions/tagged/botframework'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Update Incident',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-deploy-azure?view=azure-bot-service-4.0'
                }
            ]
        );
    
        await context.sendActivity({ attachments: [card] });
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
            console.log("Did not match with any  case");
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
        var reply = MessageFactory.suggestedActions(['Update Incident','Check IncidentHistory','Create Incident'],'What would you like to do today ?');
        await turnContext.sendActivity(reply);
    }

    async sendSuggestedActionsinEndDialogue(turnContext) {
        var reply = MessageFactory.suggestedActions(['Update Incident','Check IncidentHistory','Create Incident'],'Please continue further exploring ?');
        await turnContext.sendActivity(reply);
    }



}
module.exports.TeamsConversationBot = TeamsConversationBot;
