const rp = require('request-promise')
var config = require('./config.json')
const async = require('async')
var user_tokens={}

function sendRequest(url,reqType,reqObj,reqHeaders){
   var rp_promise = new Promise((resolve,reject)=>{   
        var options = {
            method: reqType,
            uri: url           
        };
        if(reqType == 'POST'){
            options.body = reqObj
            options.json = true        
        }
        if( reqHeaders) options.headers = reqHeaders
        rp(options).then(function(body){
            resolve(body)
        }).catch(function(err){
            reject(err)
        })
    })
    return rp_promise
}



// register users
async function register(){
    for(var i in config.orgs){
        let reqObj = {
            "username":"Tim3",
            "orgName":i
        }
        let response = await sendRequest(config.url+'/users','POST',reqObj,null)
        user_tokens[i] = response.token
    }
}

// create channel
async function createChannel(){
    let channel_req_obj = {
        "channelName":config.channelName,
        "channelConfigPath":config.channelConfigPath
    }
   
    let headers = {
        "authorization": "Bearer "+user_tokens[Object.keys(user_tokens)[0]]
    }
    let response = await sendRequest(config.url+'/channels','POST',channel_req_obj,headers)
    return response
}

// join channel
async function joinChannel(){
    for(var key in config.orgs){
        let join_req = {
            "peers": config.orgs[key]
        }
        let headers = {
            "authorization": "Bearer "+user_tokens[key]
        }
        var response = await sendRequest(config.url+'/channels/'+config.channelName+'/peers','POST',join_req,headers)
    }
    return response
}

//install chaincode
async function installChaincode(){
    for(var key in config.orgs){
        let install_req = {
            "peers":config.orgs[key],
            "chaincodeName": config.chaincodeName,
            "chaincodePath":config.chaincodePath,
            "chaincodeType": "golang",
            "chaincodeVersion":"v0"
        }
        let headers = {
            "authorization": "Bearer "+user_tokens[key]
        }
        var response = await sendRequest(config.url+'/chaincodes','POST',install_req,headers)
    }
    return response
}

//instantiate chaincode
async function instantiateChaincode(){
    // for(var key in config.orgs){
        let install_req = {
            "peers": config.orgs[Object.keys(user_tokens)[0]],
            "chaincodeName":config.chaincodeName,
            "chaincodeVersion":"v0",
            "chaincodeType": "golang",
            "args": config.instantiateArgs
        }
        let headers = {
            "authorization": "Bearer "+user_tokens[Object.keys(user_tokens)[0]]
        }
        var response = await sendRequest(config.url+'/channels/'+config.channelName+'/chaincodes','POST',install_req,headers)
    // }
    return response
}

async.waterfall(
    [
        function(cb){
            register().then(()=>{
                console.log('tokens',user_tokens)
                cb()
            })           
        },
        function(cb){
            createChannel().then((response)=>{
                console.log('create',response)
                cb()
            })
        },
        function(cb){
            setTimeout(async ()=>{
               joinChannel().then((response)=>{
                   console.log('join',response)          
                   cb()         
               })                
            },500)
        },
        function(cb){
            installChaincode().then((response)=>{
                console.log('install',response)
                cb()
            })       
        },
        function(cb){
            instantiateChaincode().then((response)=>{
                console.log('instantiate',response)
                cb()
            })
        }
    ],function(err){
        console.log('END...')
    })



