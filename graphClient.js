var request = require('request');
var _=require("underscore");
var HttpClient = require('node-rest-client').Client;
var httpClient = new HttpClient();



const optionsforTokenRequest = {
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
  };


  function getTokenRestCall(options)
  {
    return new Promise((resolve,reject) => {
        request(options, (error, response, body) => {
         
          if (response) {
            const tokenJson=JSON.parse(response.body);
            const access_token=tokenJson.access_token;
            return resolve(access_token);
          }
          if (error) {
            return reject(error);
          }
        });
      });
  }


  function getUserId(options,userEmailId)
  {
    return new Promise((resolve,reject) => {
        request(options, (error, response, body) => {
         
          if (response) {
          
            var userJson=JSON.parse(response.body);
            //  console.log("response:"+responseUser.body)
              var id="";
              _.map(userJson, function(content) {
                  _.map(content,function(data){
                     if(data.mail === userEmailId)
                        id=  data.id;      
                     })
                })
            return resolve(id);
          }
          if (error) {
            return reject(error);
          }
        });
      });
      
  }

  function getTeamId(options,teamName)
  {
    return new Promise((resolve,reject) => {
        request(options, (error, response, body) => {
         
          if (response) {
           
            var teamJson=JSON.parse(response.body);
            var teamId="";
            _.map( teamJson, function(content) {
                _.map(content,function(data){
                   if(data.displayName === teamName)
                   teamId=  data.id;      
                   })
              })
            return resolve(teamId);
          }
          if (error) {
            return reject(error);
          }
        });
      });
  }
  

  function getMessages(options)
  {
    return new Promise((resolve,reject) => {
        request(options, (error, response, body) => {
         
          if (response) {
            var todayDate = new Date().toISOString().slice(0,10);
            var contents="";
            var messageJson=JSON.parse(response.body);
          //  console.log("response :"+JSON.stringify(responseMessage))
         //   console.log("message :"+JSON.stringify(messageJson.value));
            _.map( messageJson.value, function(content) {
             var dateStr=content.createdDateTime;
             var todaysDateFromMsg=dateStr.substring(0,10);
         //    console.log("message :"+JSON.stringify(messageJson.value))
           
             if(todayDate === todaysDateFromMsg) {                            
               _.map(content.from,function(data){  
                 if(JSON.stringify(data) != 'null')            
                  contents=contents.concat(JSON.stringify(data.displayName));
                  })
                  _.map(content.body,function(data1){ 
                   var jsonObject4=content.body;
             //      console.log("data:"+JSON.stringify(jsonObject4.content)+data1==="text");
                   if(data1==="text")  { 
                   contents=contents.concat(': ',JSON.stringify(jsonObject4.content)+"\n");
     
                   }
                //  }
                 })
               } 
            return resolve(contents);
          
        });
        }
        
          if (error) {
            return reject(error);
          }
        });
      });
  }
  async function updateIncident(userEmailId,channelId,teamName)
  {
    let accessToken = await getTokenRestCall(optionsforTokenRequest);
       //  console.log("access token:"+access_token) userAPI CALL
       var optionsForUserRequest = { 
        url: 'https://graph.microsoft.com/v1.0/users',
        method: 'GET',
        headers: { 'Authorization' : "Bearer "+accessToken,
        'Content-Type': "application/json"
        }
      };

    let userId = await getUserId(optionsForUserRequest,userEmailId);
    
    var optionsForTeamRequest = { 
        url: 'https://graph.microsoft.com/v1.0/users/'+userId+'/joinedTeams',
        method: 'GET',
        headers: { 'Authorization' : "Bearer "+accessToken,
        'Content-Type': "application/json"
        }
      };
   // 

     let teamId=await getTeamId(optionsForTeamRequest,teamName);

     var optionsForMessages = { 
        url: 'https://graph.microsoft.com/beta/teams/' + teamId + '/channels/' + channelId + '/messages',
        method: 'GET',
        headers: { 'Authorization' : "Bearer "+accessToken,
        'Content-Type': "application/json"
        }
      };
   let messageDetails=await getMessages(optionsForMessages);
  console.log(''+messageDetails);
 await context.sendActivity(` Incident updated with message "${ messageDetails}"`);

  }
 
 
  
  var optionsForRemedyTokenRequest = { 
    url: 'http://vtrvitstp-03:8008/api/jwt/login',
    method: 'POST',
    form: { username: 'Aafreen_Patel',
    password: 'remedy'},
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  };

 // updateIncident('rasmiawsact02@gmail.com','19:57e2067bdc2c4623a1055d4ecb5bcf0a@thread.tacv2','CPA_POC');
  