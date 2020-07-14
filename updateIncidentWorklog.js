const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const {CardFactory} = require('botbuilder');

const RestaurantCard = require('./resources/adaptiveCards/Restaurantcard.json')

var updateIncident=require('./graphClient');

var updateRemedyWorklog=require('./bmcHelixClient')

const CARDS = [

    RestaurantCard
];

const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class UpdateIncidentDialog extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('updateIncidentDialog');



this.addDialog(new TextPrompt(TEXT_PROMPT));
this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
this.addDialog(new NumberPrompt(NUMBER_PROMPT));
this.addDialog(new DateTimePrompt(DATETIME_PROMPT));


this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
    this.firstStep.bind(this),  // Ask confirmation if user wants to make reservation?
    this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to make reservation
    this.summaryStep.bind(this)
           
]));




this.initialDialogId = WATERFALL_DIALOG;


   }

   async run(turnContext, accessor) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();
    if (results.status === DialogTurnStatus.empty) {
        await dialogContext.beginDialog(this.id);
    }
}

async firstStep(step) {
endDialog = false;
// Running a prompt here means the next WaterfallStep will be run when the users response is received.
await step.context.sendActivity({
    text: 'Enter Incident Number::',
 
});

return await step.prompt(TEXT_PROMPT, '');
      
}

async confirmStep(step){

    step.values.incidentNo = step.result

    var msg = ` You have entered following values: \n Incident Number: ${step.values.incidentNo}`

    await step.context.sendActivity(msg);

    return await step.prompt(CONFIRM_PROMPT, 'Are you sure that all values are correct and you want to update the incident?', ['yes', 'no']);
}

async summaryStep(step){

    if(step.result===true)
    {
      // Business logic
    endDialog=await this.testTeams(step.context,step.values.incidentNo);

if(endDialog===true)
{
    return await step.endDialog();    
}
else
{
      await step.context.sendActivity("Incident successfully updated")
      endDialog = true;
      return await step.endDialog();   

    }
    
    }


   
}


async isDialogComplete(){
    return endDialog;
}

async testTeams(context,inc) {

        
        
    const activity = context.activity;
    

    if(activity.channelId==='msteams')
    {
    const connector = context.adapter.createConnectorClient(activity.serviceUrl);

    const response = await connector.conversations.getConversationMembers(activity.conversation.id);

    let emailad='';

    response.forEach(element => {
        
        if(activity.from.id===element.id)
        {
            emailad=element.email;
        }
    });
    
    const teamDetails = await TeamsInfo.getTeamDetails(context);
    
    var res = activity.conversation.id.split(';');
    
    let messageDetails= await  updateIncident(emailad,res[0],teamDetails.name);
    let updateStatusCode= await updateRemedyWorklog(messageDetails,inc,step);
    await  context.sendActivity(`Your message 'Remedy updated success fully' '${updateStatusCode}' `);
}
else
{
     let messageDetails= await  updateIncident('rasmiawsact02@gmail.com','19:57e2067bdc2c4623a1055d4ecb5bcf0a@thread.tacv2','CPA_POC');
    let updateStatusCode= await updateRemedyWorklog(messageDetails,inc);
    await  context.sendActivity(`Your message 'Remedy updated success fully' '${updateStatusCode}' `);
}
   
}
}

module.exports.UpdateIncidentDialog = UpdateIncidentDialog;








