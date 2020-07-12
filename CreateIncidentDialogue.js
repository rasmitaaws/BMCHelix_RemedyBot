const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');


const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class CreateIncidentDialogue extends ComponentDialog {
    
constructor(conversationState,userState) {
        super('createIncidentDialogue');



this.addDialog(new TextPrompt(TEXT_PROMPT));
this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.noOfParticipantsValidator));
this.addDialog(new DateTimePrompt(DATETIME_PROMPT));


this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
    this.firstStep.bind(this),  // Ask confirmation if user wants to create incident?
    this.getName.bind(this),    // Get name from user
    this.getNumberOfParticipants.bind(this),  // 
    this.getDate.bind(this), // Date of creation
    this.getTime.bind(this),  // Time of creation
    this.confirmStep.bind(this), // Show summary of values entered by user and ask confirmation to create incident
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
return await step.prompt(CONFIRM_PROMPT, 'Would you like to create a new incident?', ['yes', 'no']);
      
}

async getName(step){
     
    console.log(step.result)
    if(step.result === true)
    { 
    return await step.prompt(TEXT_PROMPT, 'What should be the description of incident?');
    }
    if(step.result === false)
    { 
        await step.context.sendActivity("You chose not to go ahead with incident creation.");
        endDialog = true;
        return await step.endDialog();   
    }

}

async getNumberOfParticipants(step){
     
    step.values.name = step.result
    return await step.prompt(NUMBER_PROMPT, 'How many participants ( 1 - 150)?');
}

async getDate(step){

    step.values.noOfParticipants = step.result

    return await step.prompt(DATETIME_PROMPT, 'On which date you want to create the incident?')
}

async getTime(step){

    step.values.date = step.result

    return await step.prompt(DATETIME_PROMPT, 'At what time?')
}


async confirmStep(step){

    step.values.time = step.result

    var msg = ` You have entered following values: \n Name: ${step.values.name}\n Participants: ${step.values.noOfParticipants}\n Date: ${JSON.stringify(step.values.date)}\n Time: ${JSON.stringify(step.values.time)}`

    await step.context.sendActivity(msg);

    return await step.prompt(CONFIRM_PROMPT, 'Are you sure that all values are correct and you want to create the incident?', ['yes', 'no']);
}

async summaryStep(step){

    if(step.result===true)
    {
      // Business 

      await step.context.sendActivity("Incident successfully created. Your incident id is : 12345678")
      endDialog = true;
      return await step.endDialog();   
    
    }


   
}


async noOfParticipantsValidator(promptContext) {
    // This condition is our validation rule. You can also change the value at this point.
    return promptContext.recognized.succeeded && promptContext.recognized.value > 1 && promptContext.recognized.value < 150;
}

async isDialogComplete(){
    return endDialog;
}
}

module.exports.CreateIncidentDialogue = CreateIncidentDialogue;








