var request = require('request');
var _=require("underscore");
var HttpClient = require('node-rest-client').Client;
var httpClient = new HttpClient();




  
  var optionsForRemedyTokenRequest = { 
    url: 'http://vtrvitstp-03:8008/api/jwt/login',
    method: 'POST',
    form: { username: 'Aafreen_Patel',
    password: 'remedy'},
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  };

  function getRemedyToken(options)
  {
    return new Promise((resolve,reject) => {
        request(options, (error, response, body) => {
         
          if (response) {       
            return resolve(response.body);
          }
          if (error) {
            return reject(error);
          }
        });
      });
  }

  function getIncidentEntryUrl(options)
  {
   
    return new Promise((resolve,reject) => {
        request(options, (error, response, body) => {
         
          if (response.body) {  
            var jsonObject=JSON.parse(response.body); 
         //   console.log(jsonObject);
            var urlOfInc;
            _.map( jsonObject, function(content) {              
              _.map(content,function(data){
                _.map(data._links,function(data1){
                  _.map(data1,function(data2){
                    urlOfInc=JSON.stringify(data2.href);
                    
                })
              })
            })
            })
            var url=JSON.parse(urlOfInc);
            return resolve(url);
          }
          if (error) {
            return reject(error);
          }
        });
      });
  }

  function updateRemedyIncident(options)
  {
   
    return new Promise((resolve,reject) => {
        request(options, (error, response, body) => {
         
          if (response) { 
            return resolve(response.statusCode);
          }
          if (error) {
            return reject(error);
          }
        });
      });
  }


  async function updateRemedyWorklog(messages,inc)
  {

   let remedyToken=await getRemedyToken(optionsForRemedyTokenRequest);

   console.log("remedy TOken: "+remedyToken)
   //var inc='INC000000003102';
   var optionsForRemedyGetEntryRequest = { 
    url: "http://VTRVITSTP-03:8008/api/arsys/v1/entry/HPD:IncidentInterface?q='Incident Number'=\""+inc+"\"",
    method: 'GET',
      headers: { 'Authorization' : "AR-JWT "+remedyToken,
      'Content-Type': "application/json"
      }
  };

  let remedyEntryUrl=await getIncidentEntryUrl(optionsForRemedyGetEntryRequest);
  console.log("remedy url:"+remedyEntryUrl)

  var optionsForIncidentUpdateRequest = { 
    url: remedyEntryUrl,
    method: 'PUT',
    json: { "values": {
      "z1D_Details": messages,
      "z1D_WorklogDetails": "testing update for poc",
      "z1D Action": "MODIFY",
      "z1D_View_Access": "Internal",
      "z1D_Secure_Log": "Yes",
      "z1D_Activity_Type": "Incident Task/Action",
      "Detailed Decription": "Updated description",
      "Resolution": "User Request has been serviced",
      "Urgency" : "3-Medium"
      }},
      headers: { 'Authorization' : "AR-JWT "+remedyToken,
      'Content-Type': "application/json"
      }
  };

  let updateStatusCode=await updateRemedyIncident(optionsForIncidentUpdateRequest);

  console.log("update incident status code:"+JSON.stringify(updateStatusCode))

  return await updateStatusCode;

    
  
    
  
  }
 
 


  (async function() {
  //let message = await updateIncident('rasmiawsact02@gmail.com','19:57e2067bdc2c4623a1055d4ecb5bcf0a@thread.tacv2','CPA_POC');

})();


  module.exports=updateRemedyWorklog;