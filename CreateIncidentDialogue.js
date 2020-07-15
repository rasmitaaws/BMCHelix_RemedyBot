const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');


const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class CreateIncidentDialogue extends ComponentDialog {
    
constructor(conversationState,userState) {
        super('createIncidentDialogue');



this.addDialog(new TextPrompt(TEXT_PROMPT));
this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));



this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
    this.firstStep.bind(this),  // Ask confirmation if user wants to create incident?
    this.getFirstName.bind(this),   
    this.getLastName.bind(this), 
    this.getTemplateId.bind(this), 
    this.getDescription.bind(this), 
    this.getLoginId.bind(this), // Get name from user
    this.getServiceType.bind(this),  // 
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

async getFirstName(step){
     
    console.log(step.result)
    if(step.result === true)
    { 
    return await step.prompt(TEXT_PROMPT, 'What should be FirstName?');
    }
    if(step.result === false)
    { 
        await step.context.sendActivity("You chose not to go ahead with incident creation.");
        endDialog = true;
        return await step.endDialog();   
    }

}


async getLastName(step){
     
    step.values.firstName=step.result

    console.log(step.result);
   
    return await step.prompt(TEXT_PROMPT, 'What should be the LastName?');
   

}

async getTemplateId(step){

     step.values.lastName=step.result

    console.log(step.result);
   
    return await step.prompt(TEXT_PROMPT, 'What should be the Template for incident?');
   

}



async getDescription(step){
     
    step.values.templateId=step.result
    console.log(step.result)

    
    return await step.prompt(TEXT_PROMPT, 'What should be the description of incident?');
   

}


async getLoginId(step){

     step.values.description=step.result

    console.log(step.result)
   
    return await step.prompt(TEXT_PROMPT, 'What should be the LoginId to create incident?');
  
    }



async getServiceType(step){

     step.values.loginId=step.result
    console.log(step.result)
    
    return await step.prompt(TEXT_PROMPT, 'What should be the ServiceType .?');
   

}




async confirmStep(step){

    step.values.serviceType = step.result

    var msg = ` You have entered following values: \n FirstName: ${step.values.firstName}\n LastName: ${step.values.lastName}\n TemplateId: ${JSON.stringify(step.values.templateId)}\n LoginId: ${JSON.stringify(step.values.loginId)}`

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








