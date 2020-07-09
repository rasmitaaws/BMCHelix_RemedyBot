var request = require('request');
var _=require("underscore");
var HttpClient = require('node-rest-client').Client;


 var httpClient = new HttpClient();
   
var conversationId='';

var userId='';


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
            return resolve(tokenJson);
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
              _.map( userJson, function(content) {
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
           
            var teamJson=JSON.parse(responseTeam.body);
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
  async function updateIncident(userEmailId,channelId,teamName,context)
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
        headers: { 'Authorization' : "Bearer "+access_token,
        'Content-Type': "application/json"
        }
      };
   // 

     let teamId=await getTeamId(optionsForTeamRequest,teamName);

     var optionsForMessages = { 
        url: 'https://graph.microsoft.com/beta/teams/' + teamId + '/channels/' + channelId + '/messages',
        method: 'GET',
        headers: { 'Authorization' : "Bearer "+access_token,
        'Content-Type': "application/json"
        }
      };
   let messageDetails=await getMessages(optionsForMessages);

  await context.sendActivity(` Incident updated with message "${ messageDetails}"`);

  }
 
 
  
  var optionsForRemedyTokenRequest = { 
    url: 'http://vtrvitstp-03:8008/api/jwt/login',
    method: 'POST',
    form: { username: 'Aafreen_Patel',
    password: 'remedy'},
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  };


  // (async function() {
  //  var todayDate = new Date().toISOString().slice(0,10);
   
  

  //  let responseUser = await promisifiedRequest(optionsForUserRequest);
 
  //     console.log("user id:"+id)
  //   var optionsForTeamRequest = { 
  //       url: 'https://graph.microsoft.com/v1.0/users/'+id+'/joinedTeams',
  //       method: 'GET',
  //       headers: { 'Authorization' : "Bearer "+access_token,
  //       'Content-Type': "application/json"
  //       }
  //     };
  //     let responseTeam = await promisifiedRequest(optionsForTeamRequest);
  //     var teamJson=JSON.parse(responseTeam.body);
  //     var teamId="";
  //     _.map( teamJson, function(content) {
  //         _.map(content,function(data){
  //            if(data.displayName === "CPA_POC")
  //            teamId=  data.id;      
  //            })
  //       })
  //       console.log("team Id::"+teamId)
  //    var optionsForChannelRequest = { 
  //         url: 'https://graph.microsoft.com/v1.0/teams/' + teamId + '/channels',
  //         method: 'GET',
  //         headers: { 'Authorization' : "Bearer "+access_token,
  //         'Content-Type': "application/json"
  //         }
  //       };

  //     let responseChannel = await promisifiedRequest(optionsForChannelRequest);
  //      var channelJson=JSON.parse(responseChannel.body);
  //      var channelId="";
  //      _.map( channelJson, function(content) {
  //       _.map(content,function(data){
  //          if(data.displayName === "Incident_Query")
  //          channelId=  data.id;      
  //          })
  //     })
  //     console.log("channel Id::"+channelId)
  //     var optionsForMessages = { 
  //       url: 'https://graph.microsoft.com/beta/teams/' + teamId + '/channels/' + channelId + '/messages',
  //       method: 'GET',
  //       headers: { 'Authorization' : "Bearer "+access_token,
  //       'Content-Type': "application/json"
  //       }
  //     };
  //      let responseMessage = await promisifiedRequest(optionsForMessages);
  //      var contents="";
  //      var messageJson=JSON.parse(responseMessage.body);
  //    //  console.log("response :"+JSON.stringify(responseMessage))
  //   //   console.log("message :"+JSON.stringify(messageJson.value));
  //      _.map( messageJson.value, function(content) {
  //       var dateStr=content.createdDateTime;
  //       var todaysDateFromMsg=dateStr.substring(0,10);
  //   //    console.log("message :"+JSON.stringify(messageJson.value))
      
  //       if(todayDate === todaysDateFromMsg) {                            
  //         _.map(content.from,function(data){  
  //           if(JSON.stringify(data) != 'null')            
  //            contents=contents.concat(JSON.stringify(data.displayName));
  //            })
  //            _.map(content.body,function(data1){ 
  //             var jsonObject4=content.body;
  //       //      console.log("data:"+JSON.stringify(jsonObject4.content)+data1==="text");
  //             if(data1==="text")  { 
  //             contents=contents.concat(': ',JSON.stringify(jsonObject4.content)+"\n");

  //             }
  //          //  }
  //           })
  //         } 
  //       })
  //      console.log("contents::"+contents);
  //      let responseRemedyToken = await promisifiedRequest(optionsForRemedyTokenRequest);
  //      var inc='INC000000003102';
  //      console.log("token:"+responseRemedyToken.body);
  //      //Remedy calls
  //      var optionsForRemedyGetEntryRequest = { 
  //       url: "http://VTRVITSTP-03:8008/api/arsys/v1/entry/HPD:IncidentInterface?q='Incident Number'=\""+inc+"\"",
  //       method: 'GET',
  //       form: { "values": {
  //         "z1D_Details": contents,
  //         "z1D_WorklogDetails": "testing update for poc",
  //         "z1D Action": "MODIFY",
  //         "z1D_View_Access": "Internal",
  //         "z1D_Secure_Log": "Yes",
  //         "z1D_Activity_Type": "Incident Task/Action",
  //         "Detailed Decription": "Updated description",
  //         "Resolution": "User Request has been serviced",
  //         "Urgency" : "3-Medium"
  //         }},
  //         headers: { 'Authorization' : "AR-JWT "+responseRemedyToken.body,
  //         'Content-Type': "application/json"
  //         }
  //     };
  //     let responseEntryUrl = await promisifiedRequest(optionsForRemedyGetEntryRequest);
  // //    console.log(JSON.stringify(responseEntryUrl));
  //     var jsonObject=JSON.parse(JSON.stringify(responseEntryUrl)); 
  // //    console.log(jsonObject);
      
     



  // })();
  
 



/*  async function  clientRest(args,callback) {
    return new Promise(resolve => {
       httpClient.post("https://login.microsoftonline.com/ac26cf21-c02e-433a-8cca-237e1afccbd1/oauth2/v2.0/token", args, (data,response)=> {
        setTimeout(() => resolve(data),6000)
       })
    })
 }
 let data_image =  await  clientRest(args)
 console.log(JSON.stringify(data_image));





 function callApi(val) {
  const client = clients.createJsonClient({ url: apiUrl });
  return new Promise((resolve, reject) => {
    client.get('/my/url', (err, req, res, obj) => {
      if (err) {
        reject(err);
      } else {
        resolve(obj);
      }
    });
  });
}

// Usage
let results = await callApi(val);
/*request({
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
    console.log("data:"+data);  
    var jsonObject=JSON.parse(data);
    var id="";
    _.map( jsonObject, function(content) {
        _.map(content,function(data){
           if(data.mail === "rasmiawsact02@gmail.com")
              id=  data.id;      
           })
      })
       
      console.log("id::"+id)
      var teamId="";
      httpClient.get("https://graph.microsoft.com/v1.0/users/"+id+"/joinedTeams", args_update, function (data1, response1) {
        console.log("data teams:"+data1); 
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
    console.log("data2 channels:"+data2); 
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
        console.log("data3 messages:"+data3); 
        var contents="";
        var jsonObject3=JSON.parse(data3);
        _.map( jsonObject3.value, function(content) {
           console.log("jsonObject3====>"+JSON.stringify(content)); 
            _.map(content.from,function(data){  
              if(JSON.stringify(data) != 'null')            
          //     console.log("data ====>"+JSON.stringify(data.displayName)); 
               contents=contents.concat(JSON.stringify(data.displayName));
               })
               _.map(content.body,function(data1){ 
                var jsonObject4=content.body;
               // if(JSON.stringify(jsonObject4.contentType) ==="text" ) {
                if(data1==="text")  {
                console.log("body ====>"+JSON.stringify(jsonObject4.content)); 
                contents=contents.concat(': ',JSON.stringify(jsonObject4.content)+"\n");

                }
             //  }
              })
          })
          console.log("contents:"+contents); 
         
    }); 
  });  
 });
 });

});*/
