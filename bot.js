// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');
var HttpClient = require('node-rest-client').Client;
var httpClient = new HttpClient();
var request = require('request');
var _=require("underscore");
class EchoBot extends ActivityHandler {
   
    constructor() {
        super();
        var args = {
            data: { username: 'Aafreen_Patel',
            password: 'remedy'},
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          };
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            var replyText = 'no input';
            var INCSuccess= 'N';
            console.log(context.activity.text);
            console.log(replyText);
            if(context.activity.text == 'hey'){
                replyText = 'Hey wassup';
            }else if(context.activity.text=='update'){
                replyText='Enter the INC number'

            }else if(context.activity.text=='INC000000003006'){
                console.log(context.activity.text);
                //MS Graph API Code
                request({
                    url: 'https://login.microsoftonline.com/ac26cf21-c02e-433a-8cca-237e1afccbd1/oauth2/v2.0/token',
                    method: 'POST',
                    auth: {
                      user: '04812a6a-a5cf-4004-94fe-22a4a11c6134',
                      pass: 'Y0ufVcvSAc4s.8ojYQb2_Ba1R80~2V.C3Z'
                    },
                    form: {
                      'grant_type': 'client_credentials',
                      'scope':'https://graph.microsoft.com/.default'
                    }
                  }, function(err, res) {
                    var json = JSON.parse(res.body);
                    console.log("Access Token:", res.statusCode);
                    var args_update = { 
                      headers: { 'Authorization' : "Bearer "+json.access_token,
                      'Content-Type': "application/json"
                      }
                    };
                    httpClient.get("https://graph.microsoft.com/v1.0/users", args_update, function (data, response) {
                    
                      var jsonObject=JSON.parse(data);
                      var id="";
                      _.map( jsonObject, function(content) {
                          _.map(content,function(data){
                             if(data.mail === "rasmiawsact02@gmail.com")
                                id=  data.id;      
                             })
                        })

                        var teamId="";
                        httpClient.get("https://graph.microsoft.com/v1.0/users/"+id+"/joinedTeams", args_update, function (data1, response1) {
                          var jsonObject1=JSON.parse(data1);
                          _.map( jsonObject1, function(content) {
                              _.map(content,function(data){
                                 if(data.displayName === "CPA_POC")
                                 teamId=  data.id;      
                                 })
                            })
                            console.log("team Id::"+teamId)
                       
                     var channelId="";
                     httpClient.get("https://graph.microsoft.com/v1.0/teams/" + teamId + "/channels", args_update, function (data2, response2) {
                      var jsonObject2=JSON.parse(data2);
                      _.map( jsonObject2, function(content) {
                          _.map(content,function(data){
                             if(data.displayName === "Incident_Query")
                             channelId=  data.id;      
                             })
                        })
                        console.log("channel Id::"+channelId)
                  var displayName="";
                  
                  httpClient.get("https://graph.microsoft.com/beta/teams/" + teamId + "/channels/" + channelId + "/messages", args_update, function (data3, response3) {
                          var contents="";
                          var jsonObject3=JSON.parse(data3);
                          _.map( jsonObject3.value, function(content) {
                              _.map(content.from,function(data){  
                                if(JSON.stringify(data) != 'null')            
                                 contents=contents.concat(JSON.stringify(data.displayName));
                                 })
                                 _.map(content.body,function(data1){ 
                                  var jsonObject4=content.body;
                                  if(data1==="text")  { 
                                  contents=contents.concat(': ',JSON.stringify(jsonObject4.content)+"\n");
                  
                                  }
                               //  }
                                })
                            })
                                // Remedy Code
                httpClient.post("http://vtrvitstp-03:8008/api/jwt/login", args, function (data, response) {
                    console.log("statuscode :"+response.statusCode);
                var args_update = {
                    data: { "values": {
                    "z1D_Details": contents,
                    "z1D_WorklogDetails": "testing update for poc",
                    "z1D Action": "MODIFY",
                    "z1D_View_Access": "Internal",
                    "z1D_Secure_Log": "Yes",
                    "z1D_Activity_Type": "Incident Task/Action",
                    "Detailed Decription": "Updated description",
                    "Resolution": "User Request has been serviced",
                    "Urgency" : "3-Medium"
                    }},
                    headers: { 'Authorization' : "AR-JWT "+data,
                    'Content-Type': "application/json"
                    }
                };
                
                httpClient.put("http://VTRVITSTP-03:8008/api/arsys/v1/entry/HPD:IncidentInterface/INC000000002108%7CINC000000002108", args_update, function (data, response) {
                console.log("final statuscode :"+response.statusCode);            
                console.log(response.headers);
                if(response.statusCode == '204'){
                    INCSuccess='Y';
                }
               
                });
    
                });
                           
                      }); 
                    });  
                   });
                   });
                  
                  });


         replyText=`${ context.activity.text } Updated Successfully`;
            
        }else{            
            replyText = `Echo: ${ context.activity.text }`;
            }
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
