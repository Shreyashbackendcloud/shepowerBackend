const leaderUsermaster=require('../models/registrationleader')
const citiZenUsermaster=require('../models/registrationcitizen')
const jwtTokenService = require('../services/jwt-service')
const locations=require('../models/loaction')
const connection=require('../models/requests')
const notifications=require('../models/notification')
const users=require('../models/connection')
const likespost=require('../models/likespost')
const post=require("../models/posts")
const comment=require('../models/comments');
const replycomment=require('../models/replycomment')
const mongoose=require('mongoose')
const serviceAccount = require('../../shepower-df497-firebase-adminsdk-senfw-1ef9489880.json');
const admin = require("firebase-admin");
const {CreateGroup}=require('../models/groupChatmodule')
const grouprequest=require('../models/grouprequests')
const {isRoom}=require("../models/chatroom")
const {chatModule}=require('../models/oneTooneChat')
const storeMsg=require('../models/storeMessage')
const sosSchema=require('../models/sos')
const adminNotification=require('../models/adminNotification')
const comments = require('../models/comments')
const razorpay = require('razorpay');
const Refund = require ('../models/refund')
const Order = require('../models/order');
const locgoutCheck=require('../models/logoutSchema')
const {generateAdminTokensObject,generateAdminTokenPayload,generateUserTokenPayload,generateTokensObject } = require("../services/token.helper");
const jwt = require('jsonwebtoken');



const fetch = require('node-fetch');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const razorpayInstance  = new razorpay({
  key_id: 'rzp_test_1d8Uz0Rqn101Hj',
  key_secret: 'DREkz3zAKcStej7cslGOdYLy',
});

const messaging = admin.messaging();

exports.registrationcitizen= async (req, res) => {
    try{ 
     const {mobilenumber,token,device_id}=req.body
     if(!mobilenumber){
      return res.status(400).send({Status:false,message:'Please provide Mobile number'})
     }else if(mobilenumber){
      const istherearenot=await citiZenUsermaster.findOne({mobilenumber:mobilenumber})
      const isthere=await leaderUsermaster.findOne({mobilenumber:mobilenumber})
    if(istherearenot){
      const otp=istherearenot.otp
      const profile=istherearenot.profile
      const response=istherearenot
      if(otp===true&&profile===true){
        return res.status(400).send({Status:false,message:'You have already registerd with the Shepower' , istherearenot})
      }else if (otp===true&&profile===false){
            const tokenPayload = generateUserTokenPayload(response);
             const tokens = generateTokensObject(tokenPayload);
        return res.status(400).send({Status:false,message:'OTP verified',response,tokens})
      }else if(otp===false&&profile===false){
        return res.status(200).send({Status:true,message:'Otp sent on mobile Successfully'})
      }
     }else if(!istherearenot&&!isthere){
      const user=new citiZenUsermaster({
        mobilenumber:mobilenumber,
        token:token
        
      })
      const response=await user.save()
      const check=new locgoutCheck({
        user_id:response._id,
        newdevice_id:device_id,
        token:token
      })
      await check.save()
      if(response){
      //   const tokenPayload = generateUserTokenPayload(response);
      // const tokens = generateTokensObject(tokenPayload);
        return res.status(200).send({Status:true,message:'otp Sent Successfully to Your Mobilenumber'})
      }else{
        return res.status(400).send({Status:false,message:'something error'})
      }
    }else{
      return res.status(400).send({Status:false,message:'Already registerd'})
    }
  }
}catch(err){
         console.log(err)
        return res.status(400).send( {Status:'Error',message:'somthing went wrong'})
       }                    
  } 


exports.registrationleader= async (req, res) => {
  try{ 
     const {mobilenumber,token,device_id}=req.body
     if(!mobilenumber){
      return res.status(400).send({Status:false,message:'Please provide Mobile number'})
     }else if(mobilenumber){
      const istherearenot=await leaderUsermaster.findOne({mobilenumber:mobilenumber})
      const isthere=await citiZenUsermaster.findOne({mobilenumber:mobilenumber})
    if(istherearenot){
      const otp=istherearenot.otp
      const profile=istherearenot.profile
      const response=istherearenot
      if(otp===true&&profile===true){
        return res.status(400).send({Status:false,message:'You have already registerd with the Shepower', istherearenot})
      }else if (otp===true&&profile===false){
        const tokenPayload = generateUserTokenPayload(response);
        const tokens = generateTokensObject(tokenPayload);
        return res.status(400).send({Status:false,message:'OTP verified',response,tokens})
      }else if(otp===false&&profile===false){
        return res.status(200).send({Status:true,message:'Otp sent on mobile Successfully'})
      }
     }else if(!istherearenot&&!isthere){
      const user=new leaderUsermaster({
        mobilenumber:mobilenumber,
        token:token
      })
      const response=await user.save()
      const check=new locgoutCheck({
        user_id:response._id,
        newdevice_id:device_id,
        token:token
      })
      await check.save()
      if (response) {
        // const tokenPayload = generateUserTokenPayload(response);
        // const tokens = generateTokensObject(tokenPayload);
        return res.status(200).send({Status:true,message:'otp Sent Successfully to Your Mobilenumber'})
      }else{
        return res.status(400).send({Status:false,message:'something error'})
      }
    }else{
      return res.status(400).send({Status:false,message:'Already registerd'})
    }
  }
}catch(err){
         console.log(err)
        return res.status(400).send({Status:'Error',message:'somthing went wrong'})
       }                    
  } 
exports.otpVerifycitizen = async (req, res) => {
    try{
        const {mobilenumber} = req.body
         if(mobilenumber){
            const response=await citiZenUsermaster.findOne({mobilenumber:mobilenumber})
            const otp=response.otp

            if(otp===false&&response.profile===false){
              const result=await citiZenUsermaster.findOneAndUpdate({mobilenumber:mobilenumber},{$set:{otp:true}},{new:true})
            if(result){
                const tokenPayload = generateUserTokenPayload(result);
              const tokens = generateTokensObject(tokenPayload);
              const response=await citiZenUsermaster.findOne({mobilenumber:mobilenumber})
              return res.status(200).send({Status:true,message:'otp Verified Successfully',response,tokens})
            }else{
              return res.status(400).send({Status:false,message:'somthing went wrong'})
            }
            }else{
                        const response=await citiZenUsermaster.findOne({mobilenumber:mobilenumber})
                        const tokenPayload = generateUserTokenPayload(response);
                        const tokens = generateTokensObject(tokenPayload);
                        return res.status(400).send({Status:'false',message:'otp verified already',response,tokens})
            }
    }
    else{
      return res.status(400).send({Status:'false',message:'please provide mobilenumber'})
    }   
    }catch(err){
       
        return res.status(400).send({Status:'false',message:'somthing went wrong'})
               }
  }
exports.otpVerifyleader = async (req, res) => {
    try{
        const {mobilenumber} = req.body
         if(mobilenumber){
            const response=await leaderUsermaster.findOne({mobilenumber:mobilenumber})
            const otp=response.otp
        
            if(otp===false&&response.profile===false){ 
              const result=await leaderUsermaster.findOneAndUpdate({mobilenumber:mobilenumber},{$set:{otp:'true'}},{new:true})
            if(result){
              const tokenPayload = generateUserTokenPayload(result);
              const tokens = generateTokensObject(tokenPayload);
              const response=await leaderUsermaster.findOne({mobilenumber:mobilenumber})
              return res.status(200).send({Status:true,message:'otp Verified Successfully',response,tokens})
            }else{
              return res.status(400).send({Status:false,message:'somthing went wrong'})
            }
            
            }else{
            
              const response=await leaderUsermaster.findOne({mobilenumber:mobilenumber})
              const tokenPayload = generateUserTokenPayload(response);
              const tokens = generateTokensObject(tokenPayload);
              return res.status(400).send({Status:'false',message:'otp verified already',response,tokens})
            }
    }
    else{
      return res.status(400).send({Status:'false',message:'please provide mobilenumber'})
    }   
    }catch(err){
       
        return res.status(400).send({Status:'false',message:'somthing went wrong'})
               }
  }

  exports.loginViaOtpcitizen = async (req, res) => {
    try {
        const { mobilenumber, token} = req.body;

        if (!mobilenumber || !token) {
            return res.status(400).send({ Status: false, message: 'Please provide Mobile number and token' });
        }

        const user = await citiZenUsermaster.findOne({ mobilenumber, adminBlock: false });

        if (user) {
            const { otp, profile } = user;

            if (profile && otp ) {
                const response = await citiZenUsermaster.findOne({ mobilenumber });

                if (response) {
                  const tokenPayload = generateUserTokenPayload(response);
                  const tokens = generateTokensObject(tokenPayload);
                    return res.status(200).send({ Status: true, message: 'OTP sent successfully to your Mobile number', response ,tokens});
                } else {
                    return res.status(400).send({ Status: false, message: 'Number does not exist' });
                }
            } else {
                return res.status(400).send({ Status: false, message: 'We request you to re-register once more' });
            }
        } else {
            return res.status(400).send({ Status: false, message: 'Admin is blocked' });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send({ Status: 'Error', message: 'Something went wrong' });
    }
};

exports.loginViaOtpleader = async (req, res) => {
  try {
      const { mobilenumber, token } = req.body;

      if (!mobilenumber || !token) {
          return res.status(400).send({ Status: false, message: 'Please provide Mobile number and token' });
      }

      const user = await leaderUsermaster.findOne({ mobilenumber, adminBlock: false });

      if (user) {
          const { otp, profile } = user;

          if (profile && otp ) {
           
              const response = await leaderUsermaster.findOne({ mobilenumber });

              if (response) {
                const tokenPayload = generateUserTokenPayload(response);
                const tokens = generateTokensObject(tokenPayload);
                  return res.status(200).send({ Status: true, message: 'OTP sent successfully to your Mobile number', response,tokens });
              } else {
                  return res.status(400).send({ Status: false, message: 'Number does not exist' });
              }
          } else {
              return res.status(400).send({ Status: false, message: 'We request you to re-register once more' });
          }
      } else {
          return res.status(400).send({ Status: false, message: 'Admin is blocked' });
      }
  } catch (err) {
      console.log(err);
      return res.status(500).send({ Status: 'Error', message: 'Something went wrong' });
  }
};
exports.requestCount = async (req, res) => {
try {
  const { _id } = req.params;
  const requestCount = await users.findOne({user_id:_id},{_id:0,totalrequest:1})
  
  if (requestCount && requestCount.totalrequest) {
    const totalRequestCount = requestCount.totalrequest.length;
    console.log('Total Request Count:', totalRequestCount);
    return res.status(200).json({ status: true, message: 'Requests fetch successfully.', totalRequestCount });
  } else {
    return res.status(200).json({ status: false, message: 'User not found or totalrequest array is empty..'});
  }
  
} catch (error) {
  console.group(error)
  return res.status(500).json({ status: false, message: 'Internal server error.' });
}
};


exports.getRequest = async (req, res) => {
try {
  const { _id } = req.params;
  const requests=await users.findOne({user_id:_id})
    return res
      .status(200)
      .json({ status: true, message: 'Requests fetched successfully.', requests });
  } catch (err) {
  console.log(err)
  return res.status(500).json({ status: false, message: 'Internal server error.' });
}
}
exports.getNotification = async (req, res) => {
  try {
      const { _id } = req.params;
      const response = await notifications.find({ user_id: _id });
      let updateView = await notifications.updateMany({ user_id: _id },{ $addToSet: { viewersDetails: _id } });
      console.log("updateView->", updateView);
      return res.status(200).json({ status: true, message: `Get notification successfully`, response });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ status: false, message: 'Internal server error.' });
  }
};

exports.getNotificationCount = async (req, res) => {
  try {
    const { _id } = req.params;
    
    // Find count of notifications for the given user id
    let count = await notifications.countDocuments({ user_id: _id, viewersDetails: { $nin: [_id] } });

    
    
    // If count is false, set it to zero
    // if (count === false) {
    //   count = 0;
    // }
    
    return res.status(200).json({ status: true, message: 'Notification count retrieved successfully', count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal server error.' });
  }
};





// exports.getNotification = async (req, res) => {
//   try {
//       const { _id } = req.params;

//       // Get notifications for the user
//       const response = await notifications.find({ user_id: _id });

//       return res.status(200).json({ status: true, message: 'Get notifications successfully', response });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ status: false, message: 'Internal server error.' });
//   }
// };

// exports.getNotificationCount = async (req, res) => {
//   try {
//       const { _id } = req.params;
//       const countQueryParam = req.query.count;

//       // Get count of notifications for the user
//       let count = 0;
//       if (countQueryParam && countQueryParam.toLowerCase() === 'true') {
//           count = await notifications.countDocuments({ user_id: _id });
//       }

//       return res.status(200).json({ status: true, message: 'Notification count retrieved successfully', count });
//   } catch (error) {
//       console.error(error);
//       return res.status(500).json({ status: false, message: 'Internal server error.' });
//   }
// };


exports.rejectRequest=async(req,res)=>{
  try{
  const {fromUser,toUser}=req.body
  if(!fromUser&&!toUser){
    return res.status(400).json({status:false,message:'Please provide all the details'})
  }
  else{
    const request=await connection.findOne({fromUser:fromUser,toUser:toUser})

  
    if(request){
      const touser=request.toUser
      const formuser=request.fromUser

      const rejectl=await leaderUsermaster.findOne({_id:formuser},{_id:1,profile_img:1,firstname:1,token:1})
      const rejectc=await citiZenUsermaster.findOne({_id:formuser},{_id:1,profile_img:1,firstname:1,token:1})
      if(rejectl){
        const lname=rejectl.firstname
        const lprofile_img=rejectl.profile_img
      const data=await users.findOneAndUpdate({user_id:touser},{$pull:{totalrequest:rejectl}})
      console.log(data)
      if(data){
        const notification = {
          title: 'ShePower',
          body: `${lname} would like to connect with you`,
         icon:lprofile_img,
        };
        const data1=await notifications.findOneAndDelete({user_id:touser,request:notification})
        console.log(data1)
      if(data1){
        const response=await connection.findOneAndDelete({fromUser:fromUser,toUser:toUser})
        return res.status(200).json({status:true,message:'Request Rejected Successfully',response})
      }else{
        return res.status(400).json({status:false,message:'No notification found'})
      }
       
      }else{
        return res.status(400).json({status:false,message:'couldnot find request in userprofile'})
      }
  }
  else if(rejectc){
    const cname=rejectc.firstname
    const cprofile_img=rejectc.profile_img
    const data=await users.updateOne({user_id:touser},{$pull:{totalrequest:rejectc}})

    if(data){
      const notification = {
        title: 'ShePower',
        body: `${cname} would like to connect with you`,
       icon:cprofile_img,
      };
      const data1=await notifications.findOneAndDelete({user_id:touser,request:notification})
    if(data1){
      const response=await connection.findOneAndDelete({fromUser:fromUser,toUser:toUser})
      return res.status(200).json({status:true,message:'Request Rejected Successfully',response})
    }else{
      return res.status(400).json({status:false,message:'No notification found'})
    }
     
    }else{
      return res.status(400).json({status:false,message:'couldnot find request in userprofile'})
    }
}
  else{
    return res.status(400).json({status:false,message:'No request found'})
  }
}else{
  return res.status(400).json({status:false,message:'count find user details'})
}
}
}catch(err){
console.log(err)
    return res.status(400).json({status:'Error',message:'somthing went wrong',err})
}
}
exports.sendRequestOrConnect=async (req, res) => {
  try {
      const { fromUser, toUser } = req.body;
      const filter = {
        $and: [
          {
            fromUser:fromUser,
     toUser:toUser

          },
          {
            requestPending: true
          }
        ]
      };
      const requestExists = await connection.findOne(filter);
      const filter1 = {
        $and: [
          {
            fromUser:fromUser,
     toUser:toUser

          },
          {
            requestPending: false
          }
        ]
      };



      
      const requestExistss = await connection.findOne(filter1);
      console.log("requestExistss-->",requestExistss)
    if (requestExists) {
      return res.status(400).json({ status:false,message: 'Connection request already sent.' });
    }
    const leadertouser=await leaderUsermaster.findOne({_id:toUser,public:true},{_id:1,token:1,profile_img:1,firstname:1})
    console.log(leadertouser)
    const citizentouser=await citiZenUsermaster.findOne({_id:toUser,public :true},{_id:1,token:1,profile_img:1,firstname:1})
    console.log("citizentouser==>",citizentouser)

if(leadertouser&&!citizentouser&&!requestExistss&&!requestExists){
      const follower = new connection({
        fromUser:fromUser,
        toUser:toUser,
        requestPending:false
      });
      const response=await follower.save();
        if(follower){
      const senderl = await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
      const senderc=await citiZenUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
      if(senderl&&!senderc){
        const lprofile_img=senderl.profile_img
        const lname=senderl.firstname
     
        const data1=await citiZenUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const data= data1 ||await leaderUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const token=data.token
    const namsoftouser=data.firstname
      const touser=await users.findOne({user_id:toUser})
      if(touser){
        const update=await users.findOneAndUpdate({user_id:toUser},{$push:{connections:senderl}})
        
        if(update){
          const notification = {
              title: 'ShePower',
              body: `${lname} Connected With You`,
              icon:lprofile_img,
              
            };
            const data={
              page_name:'Notification'
            }
            if(notification){
              const noti=new notifications({
                user_id:toUser,
                accpeted_id:fromUser,
                accpeted:notification,
                settings:"public"
              })
              await noti.save()
            }
            const result=await admin.messaging().sendToDevice(token,{notification,data});
            console.log(result)
          const response=await users.findOne({user_id:toUser})
          return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
        }
      }
      else{
        const user=new users({
          user_id:toUser,
          connections:senderl
        })
        const requestsent=await user.save()
      
          if(requestsent){
        const notification = {
            title: 'ShePower',
            body: `${lname} Connected With You`,
            icon:lprofile_img
          }
          const data={
            page_name:'Notification'
          }
        
          if(notification){
            
            const noti=new notifications({
              user_id:toUser,
              accpeted_id:fromUser,
              accpeted:notification,
              settings:"public"
            })
            await noti.save()
          }
          const result=await admin.messaging().sendToDevice(token,{notification,data});
          console.log(result)
        const response=await users.findOne({user_id:toUser})
        return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
      }
    }
      }else if(senderc&&!senderl){
        const lprofile_img=senderc.profile_img
        const lname=senderc.firstname
        const data1=await citiZenUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
        const data= data1 ||await leaderUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
        const token=data.token
        const namsoftouser=data.firstname
      const touser=await users.findOne({user_id:toUser})
      if(touser){
        const update=await users.findOneAndUpdate({user_id:toUser},{$push:{connections:senderc}})
        
        if(update){
          const notification = {
              title: 'ShePower',
              body: `${lname} Connected With You`,
              icon:lprofile_img
            };
            const data={
              page_name:'Notification'
            }
            if(notification){
              const noti=new notifications({
                user_id:toUser,
                accpeted_id:fromUser,
                accpeted:notification,
                settings:"public"
              })
              await noti.save()
            }
          await admin.messaging().sendToDevice(token,{notification,data});
          const response=await users.findOne({user_id:toUser})
          return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
        }
      }
      else{
        const user=new users({
          user_id:toUser,
          connections:senderc
        })
        const requestsent=await user.save()
      
          if(requestsent){
        const notification = {
            title: 'ShePower',
            body: `${lname} Connected With You`,
            icon:lprofile_img
          }
          const data={
            page_name:'Notification'
          }
        
          if(notification){
            
            const noti=new notifications({
              user_id:toUser,
              accpeted_id:fromUser,
              accpeted:notification,
              settings:"public"
            })
            await noti.save()
          }
          const result=await admin.messaging().sendToDevice(token,{notification,data});
          console.log(result)
        const response=await users.findOne({user_id:toUser})
        return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
      }
    }
      }
      
  }
}else if(!leadertouser&&citizentouser&&!requestExistss&&!requestExists){
  const follower = new connection({
    fromUser:fromUser,
    toUser:toUser,
    requestPending:false
  });
  const response=await follower.save();
    if(follower){
  const senderl = await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
  console.log(senderl)
  const senderc=await citiZenUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
  console.log(senderc)
  if(senderl&&!senderc){
    const lprofile_img=senderl.profile_img
    const lname=senderl.firstname
    const data1=await citiZenUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const data= data1 ||await leaderUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const token=data.token
    const namsoftouser=data.firstname
  const touser=await users.findOne({user_id:toUser})
  if(touser){
    const update=await users.findOneAndUpdate({user_id:toUser},{$push:{connections:senderl}})
    
    if(update){
      const notification = {
          title: 'ShePower',
          body: `${lname} Connected With You`,
          icon:lprofile_img
        };
        const data={
          page_name:'Notification'
        }
        if(notification){
          const noti=new notifications({
            user_id:toUser,
            accpeted_id:fromUser,
            accpeted:notification,
            settings:"public"
          })
          await noti.save()
        }
        const result=await admin.messaging().sendToDevice(token,{notification,data});
        console.log(result)
      const response=await users.findOne({user_id:toUser})
      return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
    }
  }
  else{
    const user=new users({
      user_id:toUser,
      connections:senderl
    })
    const requestsent=await user.save()
  
      if(requestsent){
    const notification = {
        title: 'ShePower',
        body: `${lname} Connected With You`,
        icon:lprofile_img
      }
      const data={
        page_name:'Notification'
      }
    
      if(notification){
        
        const noti=new notifications({
          user_id:toUser,
          accpeted_id:fromUser,
          accpeted:notification,
          settings:"public"
        })
        await noti.save()
      }
      const result=await admin.messaging().sendToDevice(token,{notification,data});
      console.log(result)
    const response=await users.findOne({user_id:toUser})
    return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
  }
}
  }else if(senderc&&!senderl){
    const lprofile_img=senderc.profile_img
    const lname=senderc.firstname
 
    const data1=await citiZenUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const data= data1 ||await leaderUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const token=data.token
    const namsoftouser=data.firstname
  const touser=await users.findOne({user_id:toUser})
  if(touser){
    const update=await users.findOneAndUpdate({user_id:toUser},{$push:{connections:senderc}})
    
    if(update){
      const notification = {
          title: 'ShePower',
          body: `${lname} Connected With You`,
          icon:lprofile_img
        };
        const data={
          page_name:'Notification'
        }
        if(notification){
          const noti=new notifications({
            user_id:toUser,
            accpeted_id:fromUser,
            accpeted:notification,
            settings:"public"
          })
          await noti.save()
        }
        const result=await admin.messaging().sendToDevice(token,{notification,data});
        console.log(result)
      const response=await users.findOne({user_id:toUser})
      return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
    }
  }
  else{
    const user=new users({
      user_id:toUser,
      connections:senderc
    })
    const requestsent=await user.save()
  
      if(requestsent){
    const notification = {
        title: 'ShePower',
        body: `${lname} Connected With You`,
        icon:lprofile_img
      }
      const data={
        page_name:'Notification'
      }
    
      if(notification){
        
        const noti=new notifications({
          user_id:toUser,
          accpeted_id:fromUser,
          accpeted:notification,
          settings:"public"
        })
        await noti.save()
      }
      const result=await admin.messaging().sendToDevice(token,{notification,data});
      console.log(result)
    const response=await users.findOne({user_id:toUser})
    return res.status(200).json({status:true, message: `You Strted Following ${namsoftouser}`,response,notification});
  }
}
  }
  
}
}else if(!leadertouser&&!citizentouser&&!requestExistss&&!requestExists){
  const follower = new connection({
    fromUser:fromUser,
    toUser:toUser,
    requestPending:true
  });
  const response=await follower.save();
    if(follower){
  const senderl = await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
  console.log(senderl)
  const senderc=await citiZenUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
  console.log(senderc)
  if(senderl&&!senderc){
    const lprofile_img=senderl.profile_img
    const lname=senderl.firstname
    const data1=await citiZenUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const data= data1 ||await leaderUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const token=data.token
    const namsoftouser=data.firstname
  const touser=await users.findOne({user_id:toUser})
  if(touser){
    const update=await users.findOneAndUpdate({user_id:toUser},{$push:{totalrequest:senderl}})
    
    if(update){
      const notification = {
          title: 'ShePower',
          body: `${lname} would like to connect with you`,
          icon:lprofile_img
        };
        const data={
          page_name:'Notification'
        }
        if(notification){
          const noti=new notifications({
            user_id:toUser,
            requested_id:fromUser,
            request:notification,
            settings:"private"
          })
          await noti.save()
        }
        const result=await admin.messaging().sendToDevice(token,{notification,data});
        console.log(result)
      return res.status(200).json({status:true, message: `You sent connections request to ${namsoftouser}`,response,notification});
    }
  }
  else{
    const user=new users({
      user_id:toUser,
      totalrequest:senderl
    })
    const requestsent=await user.save()
  
      if(requestsent){
    const notification = {
        title: 'ShePower',
        body: `${lname} would like to connect with you`,
        icon:lprofile_img
      }
      const data={
        page_name:'Notification'
      }
    
      if(notification){
        
        const noti=new notifications({
          user_id:toUser,
          requested_id:fromUser,
          request:notification,
          settings:"private"
        })
        await noti.save()
      }
      const result=await admin.messaging().sendToDevice(token,{notification,data});
      console.log(result)
    return res.status(200).json({status:true, message: `You sent connections request to ${namsoftouser}`,response,notification});
  }
}
  }else if(senderc&&!senderl){
    const lprofile_img=senderc.profile_img
    const lname=senderc.firstname
    const data1=await citiZenUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const data= data1 ||await leaderUsermaster.findOne({_id:toUser},{_id:0,token:1,firstname:1})
    const token=data.token
    const namsoftouser=data.firstname
  const touser=await users.findOne({user_id:toUser})
  if(touser){
    const update=await users.findOneAndUpdate({user_id:toUser},{$push:{totalrequest:senderc}})
    
    if(update){
      const notification = {
          title: 'ShePower',
          body: `${lname} would like to connect with you`,
          icon:lprofile_img
        };
        const data={
          page_name:'Notification'
        }
        if(notification){
          const noti=new notifications({
            user_id:toUser,
            requested_id:fromUser,
            request:notification,
            settings:"private"
          })
          await noti.save()
        }
        const result=await admin.messaging().sendToDevice(token,{notification,data});
        console.log(result)
      return res.status(200).json({status:true, message: `You sent connections request to ${namsoftouser}`,response,notification});
    }
  }
  else{
    const user=new users({
      user_id:toUser,
      totalrequest:senderc
    })
    const requestsent=await user.save()
  
      if(requestsent){
    const notification = {
        title: 'ShePower',
        body: `${lname} would like to connect with you`,
        icon:lprofile_img
      }
      const data={
        page_name:'Notification'
      }
    
      if(notification){
        
        const noti=new notifications({
          user_id:toUser,
          requested_id:fromUser,
          request:notification,
          settings:"private"
        })
        await noti.save()
      }
      const result=await admin.messaging().sendToDevice(token,{notification,data});
      console.log(result)
    return res.status(200).json({status:true, message: `You sent connections request to ${namsoftouser}`,response,notification});
  }
}
  }
}
}else{
  return res.status(400).json({ status:false,message: 'Connection request already sent.' });
}
}catch (err) {
   console.log(err)
    return res.status(500).json({ status:false,message: 'Internal server error.' });
  }
}



exports.acceptRequest=async (req, res) => {
  try {
   
   const { fromUser, toUser } = req.body;
   const filter = {
     $and: [
       {
         fromUser:fromUser,
  toUser:toUser

       },
       {
         requestPending: true
       }
     ]
   };
   const requestExists = await connection.findOne(filter);
   if (!requestExists) {
     return res.status(400).json({status:false, message: 'Connection request does not exist.' });
   }
else{
  
   const update = { $set: { requestPending: false } };
   const accept = await connection.updateOne(filter,update);
   
   if(accept){
    const ldata=await leaderUsermaster.findOne({_id:toUser})

    const cdata=await citiZenUsermaster.findOne({_id:toUser})
     
    if(ldata){
   const receiver=await leaderUsermaster.findOne({_id:toUser})
   const name=receiver.firstname
   const profile_img=receiver.profile_img
   const senderl = await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
   console.log(senderl)
   const senderc = await citiZenUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1})
   console.log(senderl)
   if(senderl){
    const tokenl = senderl.token;
   const imagel=senderl.profile_img
   const namesl=senderl.firstname
   const totalrequest=await users.updateOne({user_id:toUser},{$pull:{totalrequest:senderl}})

   if(totalrequest){
     const connection=await users.updateOne({user_id:toUser},{$push:{connections:senderl}})
     if(connection){
      const deleterequest= {
        title: 'ShePower',
        body: `${namesl} would like to connect with you`,
        icon:imagel
      }
    
      await notifications.findOneAndDelete({user_id:toUser,request:deleterequest})
         const notification = {
             title: 'ShePower',
             body: `${name} accepted your connection request`,
             icon:profile_img
           };
           const data={
             page_name:'Notification'
           }
           if(notification){
             const noti=new notifications({
               user_id:fromUser,
               accpeted_id:toUser,
               accpeted:notification
             })
             await noti.save()
           }
          
         await admin.messaging().sendToDevice(tokenl,{notification,data});
         
   return res.status(200).json({status:true, message: `Connection request accepted successfully.`,notification});
 } else{
   return res.status(400).json({ status:false,message: 'something wrog while accepting' });
 }
}else{
 return res.status(400).json({ status:false,message: 'Connection request error.' });
}
}else if(senderc){
  const tokenc = senderc.token;
   const imagec=senderc.profile_img
   const namesc=senderc.firstname
  const totalrequest=await users.updateOne({user_id:toUser},{$pull:{totalrequest:senderc}})

   if(totalrequest){
     const connection=await users.updateOne({user_id:toUser},{$push:{connections:senderc}})
     if(connection){ 
      const deleterequest= {
        title: 'ShePower',
        body: `${namesc} would like to connect with you`,
        icon:imagec
      }
    
      await notifications.findOneAndDelete({user_id:toUser,request:deleterequest})
         const notification = {
             title: 'ShePower',
             body: `${name} accepted your connection request`,
             icon:profile_img
           };
           const data={
             page_name:'Notification'
           }
           if(notification){
             const noti=new notifications({
               user_id:fromUser,
               accpeted_id:toUser,
               accpeted:notification
             })
             await noti.save()
           }
          
         await admin.messaging().sendToDevice(tokenc,{notification,data});
         
   return res.status(200).json({status:true, message: `Connection request accepted successfully.`,notification});
 } else{
   return res.status(400).json({ status:false,message: 'something wrog while accepting' });
 }
}else{
 return res.status(400).json({ status:false,message: 'Connection request error.' });
}
}
}else if(cdata){
  const receiver=await citiZenUsermaster.findOne({_id:toUser})
   const name=receiver.name
   const profile_img=receiver.profile_img
   const senderl = await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1});
   const senderc=await citiZenUsermaster.findOne({_id:fromUser},{_id:1,profile_img:1,token:1,firstname:1})
   
 
   if(senderl){
    const tokenl = senderl.token;
   const imagel=senderl.profile_img
   const namesl=senderl.firstname
   const totalrequest=await users.updateOne({user_id:toUser},{$pull:{totalrequest:senderl}})
console.log(totalrequest)
   if(totalrequest){
     const connection=await users.updateOne({user_id:toUser},{$push:{connections:senderl}})
     if(connection){
      const deleterequest= {
        title: 'ShePower',
        body: `${namesl} would like to connect with you`,
        icon:imagel
      }
      await notifications.findOneAndDelete({user_id:toUser,request:deleterequest})
         const notification = {
             title: 'ShePower',
             body: `${name} accepted your connection request`,
             icon:profile_img
           };
           const data={
             page_name:'Notification'
           }
           if(notification){
             const noti=new notifications({
               user_id:fromUser,
               accpeted_id:toUser,
               accpeted:notification
             })
             await noti.save()
           }
          
         await admin.messaging().sendToDevice(tokenl,{notification,data});
         
   return res.status(200).json({status:true, message: `Connection request accepted successfully.`,notification});
 } else{
   return res.status(400).json({ status:false,message: 'something wrog while accepting' });
 }
}else{
 return res.status(400).json({ status:false,message: 'Connection request error.' });
}
}else if(senderc){
  const tokenc = senderc.token;
  const imagec=senderc.profile_img
  const namesc=senderc.firstname
  const totalrequest=await users.updateOne({user_id:toUser},{$pull:{totalrequest:senderc}})

  if(totalrequest){
    const connection=await users.updateOne({user_id:toUser},{$push:{connections:senderc}})
    if(connection){
     const deleterequest= {
       title: 'ShePower',
       body: `${namesc} would like to connect with you`,
       icon:imagec
     }
   
     await notifications.findOneAndDelete({user_id:toUser,request:deleterequest})
        const notification = {
            title: 'ShePower',
            body: `${name} accepted your connection request`,
            icon:profile_img
          };
          const data={
            page_name:'Notification'
          }
          if(notification){
            const noti=new notifications({
              user_id:fromUser,
              accpeted_id:toUser,
              accpeted:notification
            })
            await noti.save()
          }
         
        await admin.messaging().sendToDevice(tokenc,{notification,data});
        
  return res.status(200).json({status:true, message: `Connection request accepted successfully.`,notification});
} else{
  return res.status(400).json({ status:false,message: 'something wrog while accepting' });
}
}else{
return res.status(400).json({ status:false,message: 'Connection request error.' });
}
}
}
}
}
}catch (error) {
 console.log(error)
   return res.status(500).json({ message: 'Internal server error.' });
 }
}


exports.getConnections = async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await users.findOne({user_id:_id},{_id:0,connections:1})
    
    console.log(result)
    if (result) {
      res.send({ status: true, message: 'Get Data Successfully', result });
    } else {
      res.status(401).send({ message: 'No Any data available' });
    }
  } catch (err) {
    console.log(err)
    res.send({ message: 'Something went wrong' });
  }
};

exports.disconnectUsers = async (req, res) => {
  try {
    let { fromUser, toUser } = req.body;

    // Convert toUser to ObjectId
    // toUser = new mongoose.Types.ObjectId(toUser);
    fromUser = new mongoose.Types.ObjectId(fromUser);

    if (!toUser || !fromUser) {
      return res.status(400).json({ Status: false, message: "Please provide IDs for both fromUser and toUser" });
    } else {
      // Update connections array in users collection
      const checkData = await users.findOne(
        { user_id: toUser },)
      const response = await users.findOneAndUpdate(
        { user_id: toUser },
        { $pull: { connections: { _id: fromUser } } },
        { new: true }
      );

      // Convert toUser back to string
      let toUser_str = toUser.toString();

      // Delete document from connection collection
      const requestExists = await connection.findOneAndDelete({ fromUser: fromUser, toUser: toUser });

      console.log("checkData==>", checkData);
      console.log("requestExists==>", requestExists);
      console.log("response==>", response);
      if (response) {
        return res.status(200).json({ Status: true, message: "User removed successfully", response });
      } else {
        return res.status(400).json({ Status: false, message: "Something went wrong" });
      }
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).send({ status: false, message: err.message || 'Something went wrong' });
  }
}


// exports.disconnectUsers = async (req, res) => {
//   try {
//     const { fromUser, toUser } = req.body;

//     // Disconnect 'fromUser' from 'toUser'
//     const disconnectFromUser = await users.updateOne(
//       { user_id: fromUser },
//       { $pull: { connections: toUser } }
//     );

//     // Disconnect 'toUser' from 'fromUser'
//     const disconnectToUser = await users.updateOne(
//       { user_id: toUser },
//       { $pull: { connections: fromUser } }
//     );

//     // Check if disconnections were successful
//     if (disconnectFromUser && disconnectToUser) {
//       // Update connection count for both users
//       const updatedFromUser = await users.findOne({ user_id: fromUser });
//       const updatedToUser = await users.findOne({ user_id: toUser });
//       const fromUserConnectionCount = updatedFromUser?.connections?.length || 0;
//       const toUserConnectionCount = updatedToUser?.connections?.length || 0;

//       // Return success response with updated connection counts
//       return res.status(200).json({ status: true, message: 'Users disconnected successfully.', fromUserConnectionCount, toUserConnectionCount });
//     } else {
//       return res.status(400).json({ status: false, message: 'Failed to disconnect users.' });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ status: false, message: 'Internal server error.' });
//   }
// };




exports. likePost = async(req, res) => {
  try {
    const { post_id, liker_id } = req.body;
    if (!post_id || !liker_id) {
      return res.status(400).json({ Status: false, message: 'Please provide all the details' });
    } else {
      const check= await post.findOne({_id:post_id},{user_id:1,_id:0})
      const postuser_id=check.user_id.toString()
      const likerData = await leaderUsermaster.findOne({_id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });

const liker= likerData || await citiZenUsermaster.findOne({_id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });

      if(liker){
        const name=liker.firstname
        const profile_img=liker.profile_img
        const data=await post.findOne({_id:post_id},{_id:0,user_id:1})

        const data1=data.user_id
        const user_ids = await leaderUsermaster.findOne({ _id: data1 }, { _id: 0, token: 1 })
       const  user_id = user_ids || await citiZenUsermaster.findOne({ _id: data1 }, { _id: 0, token: 1 });

      
      
        const token=user_id.token
        const likesPost = await likespost.findOne({ post_id: post_id });
      
        if (likesPost) {
          const likesOfPosts = likesPost.likesofposts;
          
          if (likesOfPosts.length>0&&likesOfPosts.some((obj) => obj._id.toString() === liker_id)) {
            const response=await likespost.updateOne({ post_id: post_id }, { $pull: { likesofposts: liker } });
           
            if(response){
              const count=await likespost.findOne({post_id:post_id})
              const likes=count?count.likesofposts.length : 0
            
              const totallikes=await likespost.findOneAndUpdate({post_id:post_id},{$set:{totallikesofpost:likes}})
              await post.findOneAndUpdate({_id:post_id},{$set:{totallikesofpost:likes}})
              await post.updateOne({_id:post_id},{ $pull:{likedpeopledata:liker}})
              if(totallikes){
                const notification = {
                  title: 'ShePower',
                  body: `${name} Liked your Post`,
                  icon:profile_img
                };
                
                if(notification){
                  await notifications.findOneAndDelete({post_id:post_id,likespost:notification})
                  const result=await likespost.findOne({post_id:post_id})
                return res.status(200).json({ Status: true, message: 'Liker removed from likesofposts',result });
                }else{
                  return res.status(400).json({ Status: false, message: 'Eoror Coudnot find Notification' });
                }
              }else{
                return res.status(400).json({ Status: false, message: 'Eoror while Liker removed from likesofposts' });
              }
            }else{
              return res.status(400).json({ Status: false, message: 'Eoror while Liker removed from likesofposts' });
            }
          } else {
            const response=await likespost.updateOne({ post_id: post_id }, { $push: { likesofposts: liker } });
           
            if(response){
              const count=await likespost.findOne({post_id:post_id})
          const likes=count?count.likesofposts.length : 0
         
          const totallikes=await likespost.findOneAndUpdate({post_id:post_id},{$set:{totallikesofpost:likes}})
          const total=await post.updateOne({_id:post_id},{$set:{totallikesofpost:likes}})
          await post.updateOne({_id:post_id},{ $push:{likedpeopledata:liker}})
          if(totallikes&&total){
            console.log(postuser_id)
           if(liker_id!==postuser_id){
              const notification = {
                                        title: 'ShePower',
                                        body: `${name} Liked your Post`,
                                        icon:profile_img
                                      };
                                      const data={
                                        page_name:'Notification'
                                      }
                                                            if(notification){
                                                              const noti=new notifications({
                                                                post_id:post_id,
                                                                user_id:data1,
                                                                likespost:notification,
                                                                post_liker_id:liker_id
                                                              })
                                                              await noti.save()
                                                            }
                                                         const respon= await admin.messaging().sendToDevice(token,{notification,data});
                                                          const result=await likespost.findOne({post_id:post_id})
                                                return res.status(200).json({Status:true,message:'liked your post',result,respon})
                                                          }else{
                                                            const result=await likespost.findOne({post_id:post_id})
                                                  return res.status(200).json({Status:true,message:'liked your post',result})
                                                           }
            }else{
              return res.status(200).json({ Status: true, message: 'coudnt Liker added to likesofposts' });
            }
          }else{
              return res.status(400).json({ Status: false, message: 'Eoror while Liker adding to likesofposts' });
            }
          }
        
        } else {
          const data = new likespost({
            post_id: post_id,
            user_id:data1,
            likesofposts: liker
          });
          const response=await data.save();
          console.log(response)
    
          if(response){
            const count=await likespost.findOne({post_id:post_id})
            const likes=count?count.likesofposts.length : 0
           
            const totallikes=await likespost.findOneAndUpdate({post_id:post_id},{$set:{totallikesofpost:likes}})
            const total=await post.updateOne({_id:post_id},{$set:{totallikesofpost:likes}})
            await post.updateOne({_id:post_id},{ $push:{likedpeopledata:liker}})
            if(totallikes&&total){
              if(liker_id!=postuser_id){
              const notification = {
                title: 'ShePower',
                body: `${name} Liked your Post`,
                icon:profile_img
              };
              const data={
                page_name:'Notification'
              }
              if(notification){
                const noti=new notifications({
                  post_id:post_id,
                  user_id:data1,
                  likespost:notification,
                  post_liker_id:liker_id
  
                })
                await noti.save()
              }
            const respon=await admin.messaging().sendToDevice(token,{notification,data});
            const result=await likespost.findOne({post_id:post_id})
  return res.status(200).json({Status:true,message:'liked your post',result,respon})
           }else{
            const result=await likespost.findOne({post_id:post_id})
  return res.status(200).json({Status:true,message:'liked your post',result})
           }
           }else{
             
              return res.status(400).json({ Status: false, message: 'Eoror while Liker adding to likesofposts' });
            }
        }else{
          return res.status(400).json({ Status: false, message: 'Eoror while Liker adding to likesofposts' });
        }
  
      }
  }
          }
  } catch (err) {
    console.log(err)
    return res.status(400).json({ Status: 'Error', Error });
  }
}
exports.getLikesOfPost = async (req, res) => {
  try {
    const { post_id } = req.body;
    const response = await likespost.findOne({post_id:post_id})
    if (response) {
      return res.status(200).json({ Status: true, message: 'Likes fetched successfully', response });
    } else {
      return res.status(400).json({ Status: false, message: 'Could not find the post' });
    }
  } catch (err) {
    return res.status(400).json({ Status: 'Error', Error: err });
  }
};
exports.addComment = async (req, res) => {
  try {
    const { post_id, commenter_id, text } = req.body;

    if (!post_id || !commenter_id) {
      return res.status(400).json({ Status: false, message: 'Please provide all the details' });
    } else {
      const check= await post.findOne({_id:post_id},{user_id:1,_id:0})
      const postuser_id=check.user_id.toString()
      const commenters = await leaderUsermaster.findOne({ _id: commenter_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });

      const commenter= commenters || await citiZenUsermaster.findOne({ _id: commenter_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
      if (commenter) {
        const name = commenter.firstname;
        const profile_img = commenter.profile_img;

        const postData = await post.findOne({ _id: post_id }, { _id: 0, user_id: 1 });
        const user_id = postData.user_id;

        const userData1 = await citiZenUsermaster.findOne({ _id: user_id }, { _id: 0, token: 1 });
        const userData= userData1 || await leaderUsermaster.findOne({ _id: user_id }, { _id: 0, token: 1 });
        const token = userData.token;

        const newComment = new comment({
          post_id: post_id,
          commentdetails: commenter,
          text: text
        });

        const response = await newComment.save();
        const comment_id = response._id;

        if (response) {
          if(postuser_id!=commenter_id){
          const notification = {
            title: 'ShePower',
            body: `${name} Commented On your Post`,
            icon: profile_img
          };
          const data = {
            page_name: 'Notification'
          };

          if (notification) {
            const noti = new notifications({
              post_id: post_id,
              user_id: user_id,
              comment_id: comment_id,
              post_commenter_id: commenter_id,
              comment: notification
            });
            await noti.save();
          }

          await admin.messaging().sendToDevice(token, { notification, data });

          const count = Number(await comment.find({ post_id: post_id }).countDocuments());
          const counts = Number(await replycomment.find({ post_id: post_id }).countDocuments());

          const total = count + counts;
          const dataupdate=await post.findOneAndUpdate({ _id: post_id }, { $set: { totalcomments: total } });
console.log(dataupdate)
          return res.status(200).json({ Status: true, message: 'Commented On Your Post', response, notification });
        }else{
          const count = Number(await comment.find({ post_id: post_id }).countDocuments());
          const counts = Number(await replycomment.find({ post_id: post_id }).countDocuments());

          const total = count + counts;
          const dataupdate=await post.findOneAndUpdate({ _id: post_id }, { $set: { totalcomments: total } });
console.log(dataupdate)
          return res.status(200).json({ Status: true, message: 'Commented On Your Post', response });
        }
        } else {
          return res.status(400).json({ Status: false, message: 'Error while Commenting the Data' });
        }

      } else {
        return res.status(400).json({ Status: false, message: 'No post found' });
      }
    }

  } catch (err) {
    return res.status(400).json({ Status: 'Error', Error: err.message });
  }
};
exports.addReplyComment=async(req,res)=>{
  try{
const {post_id,comment_id,commenter_id,text}=req.body
if (!post_id || !commenter_id||!comment_id||!text) {
  return res.status(400).json({ Status: false, message: 'Please provide all the details' });
}else{
  const check= await post.findOne({_id:post_id},{user_id:1,_id:0})
      const postuser_id=check.user_id.toString()
  const commenters = await leaderUsermaster.findOne({ _id: commenter_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
  const commenter = commenters || await citiZenUsermaster.findOne({ _id: commenter_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
  const name=commenter.firstname
  const profile_img=commenter.profile_img
  const data=await comment.find({post_id:post_id,_id:comment_id},{_id:0,commentdetails:1})
  console.log(data)
  const user_id =data[0].commentdetails._id
  const data1l = await leaderUsermaster.findOne({ _id: user_id });
const data1 = data1l || await citiZenUsermaster.findOne({ _id: user_id });
const token = data1.token;

  const posting=await post.findOne({_id:post_id},{_id:0,user_id:1})
  const poster=posting.user_id
  const postdl=await leaderUsermaster.findOne({_id:poster},{_id:0,token:1})
  const postd=postdl || await citiZenUsermaster.findOne({_id:poster},{_id:0,token:1})
  const postertoken=postd.token
    if(commenter){
    const data=new replycomment({
      post_id:post_id,
      comment_id:comment_id,
      commentdetails:commenter,
      text:text
    })
    const response=await data.save()
    const replycomment_id=response._id
    if(response){
      if(postuser_id!=commenter_id){
      const notification1 = {
        title: 'ShePower',
        body: `${name} Commented On your Post`,
        icon:profile_img
      };
      const data1={
        page_name:'Notification'
      }
      const notification2= {
        title: 'ShePower',
        body: `${name} Mentioned You On Comment`,
        icon:profile_img
      };
      const data2={
        page_name:'Notification'
      }
      if(notification1&&data1){
        const noti=new notifications({
          post_id:post_id,
          comment_id:comment_id,
          user_id:poster,
          replycomment_id:replycomment_id,
          replyCommenter_id:commenter_id,
          replyComment:notification1
        })
        await noti.save()
        const notis=new notifications({
          post_id:post_id,
          comment_id:comment_id,
          user_id:user_id,
          replycomment_id:replycomment_id,
          mentioner_id:commenter_id,
          mentioned:notification2
        })
        await notis.save()
      }
    await admin.messaging().sendToDevice(postertoken,{notification:notification1,data:data1});
    await admin.messaging().sendToDevice(token,{notification:notification2,data:data2});
    const count =Number(await comment.find({ post_id: post_id }).countDocuments());
    const counts=Number(await replycomment.find({post_id:post_id}).countDocuments())
    const total=count+counts
    await post.findOneAndUpdate({_id:post_id},{$set:{totalcomments:total}})
return res.status(200).json({Status:true,message:'Commented On Your POst',response,notification1,data1,notification2,data2})
    }else{
      const count =Number(await comment.find({ post_id: post_id }).countDocuments());
      const counts=Number(await replycomment.find({post_id:post_id}).countDocuments())
      const total=count+counts
      await post.findOneAndUpdate({_id:post_id},{$set:{totalcomments:total}})
  return res.status(200).json({Status:true,message:'Commented On Your POst',response})
    }
    }else{
 return res.status(400).json({ Status: false, message: 'Eoror while Commenting the Data' });
    }

  }else{
    return res.status(400).json({ Status: false, message: 'nno post found' });
  }
}
}catch(err){
    console.log(err)
    return res.status(400).json({Status:'Error',Error})
}
}
// exports.likeComment=async(req,res)=>{
//   try{
// const {post_id,comment_id,liker_id}=req.body
// if (!post_id || !comment_id||!liker_id) {
//   return res.status(400).json({ Status: false, message: 'Please provide all the details' });
// }else{
//   const check= await post.findOne({_id:post_id},{user_id:1,_id:0})
//       const postuser_id=check.user_id.toString()
// const response= await comment.findOne({post_id:post_id,_id:comment_id})
// const liker1 = await leaderUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
// const liker= liker1 || await citiZenUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
//   const name=liker.firstname
//   const profile_img=liker.profile_img
//   const data=await comment.find({post_id:post_id,_id:comment_id},{_id:0,commentdetails:1})
//   console.log(data)
//   const user_id =data[0].commentdetails._id
//   const token = data[0].commentdetails.token
 
// if(response){
//   const commentlikerDetails = response.commentlikerDetails;
       
//   if (commentlikerDetails.some((obj) => obj._id.toString() === liker_id)) {
//   const response=await comment.updateOne({post_id:post_id,_id:comment_id},{$pull:{commentlikerDetails:liker}})
//   if(response){
//     const count=await comment.findOne({post_id:post_id,_id:comment_id})
//     const likes=count?count.commentlikerDetails.length : 0
    
//     const totallikes=await comment.findOneAndUpdate({post_id:post_id,_id:comment_id},{$set:{totallikesofcomments:likes}})
//     if(totallikes){
//       if(liker_id!=postuser_id){
//       const notification = {
//         title: 'shePower',
//         body: `${name} Liked your Comment`,
//         icon:profile_img
//       };
//       if(notification){
//         await notifications.findOneAndDelete({post_id:post_id,comment_id:comment_id,likecomment:notification})
//         const result=await comment.findOne({post_id:post_id,_id:comment_id})
//       return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
//       }else{
//         return res.status(400).json({ Status: false, message: 'Eoror Coudnot find Notification' });
//       }
//     }else{
    
//       const result=await comment.findOne({post_id:post_id,_id:comment_id})
//     return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
//     }
//   }else{
//       return res.status(400).json({ Status: false, message: 'Eoror while Liker removed from Comments' });
//     }
//   }else{
//     return res.status(400).json({ Status: false, message: 'Coudnot Like The Comment' });
//   }
// }else{
//   const response=await comment.updateOne({ post_id: post_id,_id:comment_id }, { $push: { commentlikerDetails:liker} });
 
//   if(response){
//     const count=await comment.findOne({post_id:post_id,_id:comment_id})
// const likes=count?count.commentlikerDetails.length : 0

// const totallikes=await comment.findOneAndUpdate({post_id:post_id,_id:comment_id},{$set:{totallikesofcomments:likes}})
// if(totallikes){
//     if(liker_id!=postuser_id){
//     const notification = {
//                               title: 'ShePower',
//                               body: `${name} Liked your Comment`,
//                               icon:profile_img
//                             };
//                             const data={
//                               page_name:'Notification'
//                             }
//                                                   if(notification){
                                                    
//                                                     const noti=new notifications({
//                                                       post_id:post_id,
//                                                       user_id:user_id,
//                                                       comment_id:comment_id,
//                                                       likecomment:notification,
//                                                       commente_liker_id:liker_id
//                                                     })
//                                                     await noti.save()
//                                                   }
//                                                 await admin.messaging().sendToDevice(token,{notification,data});
//                                       return res.status(200).json({Status:true,message:'liked your Comment',notification})
//   }else{
//     return res.status(200).json({Status:true,message:'liked your Comment'})
//   }
// }else{
//     return res.status(400).json({ Status: false, message: 'coudnt Liker added to comment' });
//   }
// }else{
//     return res.status(400).json({ Status: false, message: 'Eoror while Liker adding to comment' });
//   }
// }
// }
//  } 
// }catch(err){
//     console.log(err)
//     return res.status(400).json({Status:'Error',Error})
//   }
// }
exports.likeComment=async(req,res)=>{
  try{
const {post_id,comment_id,liker_id}=req.body
if (!post_id || !comment_id||!liker_id) {
  return res.status(400).json({ Status: false, message: 'Please provide all the details' });
}else{
  const check= await post.findOne({_id:post_id},{user_id:1,_id:0})
      const postuser_id=check.user_id.toString()
const response= await comment.findOne({post_id:post_id,_id:comment_id})
const liker1 = await leaderUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
const liker= liker1 || await citiZenUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
  const name=liker.firstname
  const profile_img=liker.profile_img
  const data=await comment.find({post_id:post_id,_id:comment_id},{_id:0,commentdetails:1})
  console.log(data)
  const user_id =data[0].commentdetails._id
  const token = data[0].commentdetails.token
 
if(response){
  const commentlikerDetails = response.commentlikerDetails;
       
  if (commentlikerDetails.some((obj) => obj._id.toString() === liker_id)) {
  const response=await comment.updateOne({post_id:post_id,_id:comment_id},{$pull:{commentlikerDetails:liker}})
  if(response){
    const count=await comment.findOne({post_id:post_id,_id:comment_id})
    const likes=count?count.commentlikerDetails.length : 0
    
    const totallikes=await comment.findOneAndUpdate({post_id:post_id,_id:comment_id},{$set:{totallikesofcomments:likes}})
    if(totallikes){
      if(liker_id!=postuser_id){
      const notification = {
        title: 'shePower',
        body: `${name} Liked your Comment`,
        icon:profile_img
      };
      if(notification){
        await notifications.findOneAndDelete({post_id:post_id,comment_id:comment_id,likecomment:notification})
        const result=await comment.findOne({post_id:post_id,_id:comment_id})
      return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
      }else{
        return res.status(400).json({ Status: false, message: 'Eoror Coudnot find Notification' });
      }
    }else{
    
      const result=await comment.findOne({post_id:post_id,_id:comment_id})
    return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
    }
  }else{
      return res.status(400).json({ Status: false, message: 'Eoror while Liker removed from Comments' });
    }
  }else{
    return res.status(400).json({ Status: false, message: 'Coudnot Like The Comment' });
  }
}else{
  const response=await comment.updateOne({ post_id: post_id,_id:comment_id }, { $push: { commentlikerDetails:liker} });
 
  if(response){
    const count=await comment.findOne({post_id:post_id,_id:comment_id})
const likes=count?count.commentlikerDetails.length : 0

const totallikes=await comment.findOneAndUpdate({post_id:post_id,_id:comment_id},{$set:{totallikesofcomments:likes}})
if(totallikes){
    if(liker_id!=postuser_id){
    const notification = {
                              title: 'ShePower',
                              body: `${name} Liked your Comment`,
                              icon:profile_img
                            };
                            const data={
                              page_name:'Notification'
                            }
                                                  if(notification){
                                                    
                                                    const noti=new notifications({
                                                      post_id:post_id,
                                                      user_id:user_id,
                                                      comment_id:comment_id,
                                                      likecomment:notification,
                                                      commente_liker_id:liker_id
                                                    })
                                                    await noti.save()
                                                  }
                                                await admin.messaging().sendToDevice(token,{notification,data});
                                                // const result=await comment.findOne({post_id:post_id,_id:comment_id})
                                      return res.status(200).json({Status:true,message:'liked your Comment',notification})
  }else{
    const result=await comment.findOne({post_id:post_id,_id:comment_id,})
    return res.status(200).json({Status:true,message:'liked your Comment',result})
  }
}else{
    return res.status(400).json({ Status: false, message: 'coudnt Liker added to comment' });
  }
}else{
    return res.status(400).json({ Status: false, message: 'Eoror while Liker adding to comment' });
  }
}
}
 } 
}catch(err){
    console.log(err)
    return res.status(400).json({Status:'Error',Error})
  }
}

// exports.replyCommentlike=async(req,res)=>{
//   try{
// const {post_id,comment_id,replycomment_id,liker_id}=req.body
// if (!post_id || !comment_id||!liker_id||!replycomment_id) {
//   return res.status(400).json({ Status: false, message: 'Please provide all the details' });
// }else{
//   const check= await post.findOne({_id:post_id},{user_id:1,_id:0})
//       const postuser_id=check.user_id.toString()
// const response= await replycomment.findOne({_id:replycomment_id})

// const liker1 = await leaderUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
// const liker =  liker1 || await citiZenUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });

//   const name=liker.firstname
//   const profile_img=liker.profile_img
//   const data=await replycomment.findOne({_id:replycomment_id})
//   console.log(data)
//   const token= data.commentdetails.token

//   const user_id= data.commentdetails._id;
 
// if(response){
//   const commentlikerDetails = response.commentlikerDetails;
       
//   if (commentlikerDetails.some((obj) => obj._id.toString() === liker_id)) {
//   const response=await replycomment.updateOne({_id:replycomment_id},{$pull:{commentlikerDetails:liker}})
//   if(response){
//     const count=await replycomment.findOne({_id:replycomment_id})
//     const likes=count?count.commentlikerDetails.length : 0
   
//     const totallikes=await replycomment.findOneAndUpdate({_id:replycomment_id},{$set:{totallikesofcomments:likes}})
//     if(totallikes){
//       if(postuser_id!=liker_id){
//       const notification = {
//         title: 'ShePower',
//         body: `${name} Liked your Comment`,
//         icon:profile_img
//       };
     
      
//       if(notification){
//         await notifications.findOneAndDelete({ post_id:post_id,comment_id:comment_id,replycomment_id:replycomment_id,replyCommentlike:notification}) 
//         const result=await replycomment.findOne({_id:replycomment_id})
//       return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
//       }else{
//         return res.status(400).json({ Status: false, message: 'Eoror Coudnot find Notification' });
//       }
//     }else{
//       const result=await replycomment.findOne({_id:replycomment_id})
//       return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
//     }
//   }else{
//       return res.status(400).json({ Status: false, message: 'Eoror while Liker removed from Comments' });
//     }
//   }else{
//     return res.status(400).json({ Status: false, message: 'Coudnot Like The Comment' });
//   }
// }else{
//   const response=await replycomment.updateOne({_id:replycomment_id}, { $push: { commentlikerDetails:liker} });
  
//   if(response){
//     const count=await replycomment.findOne({_id:replycomment_id})
// const likes=count?count.commentlikerDetails.length : 0

// const totallikes=await replycomment.findOneAndUpdate({_id:replycomment_id},{$set:{totallikesofcomments:likes}})
// if(totallikes){
//   if(postuser_id!=liker_id){
//     const notification = {
//                               title: 'ShePower',
//                               body: `${name} Liked your Comment`,
//                               icon:profile_img
//                             };
//                             const data={
//                               page_name:'Notification'
//                             }
//                                                   if(notification){
//                                                     const noti=new notifications({
//                                                       post_id:post_id,
//                                                       comment_id:comment_id,
//                                                       user_id:user_id,
//                                                       replycomment_id:replycomment_id,
//                                                       replyCommentlike :notification,
//                                                       replyCommente_liker_id:liker_id
//                                                     })
//                                                     await noti.save()
//                                                   }
//                                                 await admin.messaging().sendToDevice(token,{notification,data});
//                                       return res.status(200).json({Status:true,message:'liked your Comment',notification})
//   }else{
//     return res.status(200).json({Status:true,message:'liked your Comment'})
//   }
// }else{
//     return res.status(400).json({ Status: false, message: 'coudnt Liker added to comment' });
//   }
// }else{
//     return res.status(400).json({ Status: false, message: 'Eoror while Liker adding to comment' });
//   }
// }
// }
//  } 
// }catch(err){
//    console.log(err)
//     return res.status(400).json({Status:'Error',Error})
//   }
// }

exports.replyCommentlike=async(req,res)=>{
  try{
const {post_id,comment_id,replycomment_id,liker_id}=req.body
if (!post_id || !comment_id||!liker_id||!replycomment_id) {
  return res.status(400).json({ Status: false, message: 'Please provide all the details' });
}else{
  const check= await post.findOne({_id:post_id},{user_id:1,_id:0})
      const postuser_id=check.user_id.toString()
const response= await replycomment.findOne({_id:replycomment_id})

const liker1 = await leaderUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });
const liker =  liker1 || await citiZenUsermaster.findOne({ _id: liker_id }, { _id: 1, firstname: 1, profile_img: 1, token: 1 });

  const name=liker.firstname
  const profile_img=liker.profile_img
  const data=await replycomment.findOne({_id:replycomment_id})
  console.log(data)
  const token= data.commentdetails.token

  const user_id= data.commentdetails._id;
 
if(response){
  const commentlikerDetails = response.commentlikerDetails;
       
  if (commentlikerDetails.some((obj) => obj._id.toString() === liker_id)) {
  const response=await replycomment.updateOne({_id:replycomment_id},{$pull:{commentlikerDetails:liker}})
  if(response){
    const count=await replycomment.findOne({_id:replycomment_id})
    const likes=count?count.commentlikerDetails.length : 0
   
    const totallikes=await replycomment.findOneAndUpdate({_id:replycomment_id},{$set:{totallikesofcomments:likes}})
    if(totallikes){
      if(postuser_id!=liker_id){
      const notification = {
        title: 'ShePower',
        body: `${name} Liked your Comment`,
        icon:profile_img
      };
     
      
      if(notification){
        await notifications.findOneAndDelete({ post_id:post_id,comment_id:comment_id,replycomment_id:replycomment_id,replyCommentlike:notification}) 
        const result=await replycomment.findOne({_id:replycomment_id})
      return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
      }else{
        return res.status(400).json({ Status: false, message: 'Eoror Coudnot find Notification' });
      }
    }else{
      const result=await replycomment.findOne({_id:replycomment_id})
      return res.status(200).json({ Status: true, message: 'Liker removed from Your Comment',result });
    }
  }else{
      return res.status(400).json({ Status: false, message: 'Eoror while Liker removed from Comments' });
    }
  }else{
    return res.status(400).json({ Status: false, message: 'Coudnot Like The Comment' });
  }
}else{
  const response=await replycomment.updateOne({_id:replycomment_id}, { $push: { commentlikerDetails:liker} });
  
  if(response){
    const count=await replycomment.findOne({_id:replycomment_id})
const likes=count?count.commentlikerDetails.length : 0

const totallikes=await replycomment.findOneAndUpdate({_id:replycomment_id},{$set:{totallikesofcomments:likes}})
if(totallikes){
  if(postuser_id!=liker_id){
    const notification = {
                              title: 'ShePower',
                              body: `${name} Liked your Comment`,
                              icon:profile_img
                            };
                            const data={
                              page_name:'Notification'
                            }
                                                  if(notification){
                                                    const noti=new notifications({
                                                      post_id:post_id,
                                                      comment_id:comment_id,
                                                      user_id:user_id,
                                                      replycomment_id:replycomment_id,
                                                      replyCommentlike :notification,
                                                      replyCommente_liker_id:liker_id
                                                    })
                                                    await noti.save()
                                                  }
                                                await admin.messaging().sendToDevice(token,{notification,data});
                                                const result=await replycomment.findOne({_id:replycomment_id})
                                      return res.status(200).json({Status:true,message:'liked your Comment',notification,result})
  }else{
    const result=await replycomment.findOne({_id:replycomment_id})
    return res.status(200).json({Status:true,message:'liked your Comment',result})
  }
}else{
    return res.status(400).json({ Status: false, message: 'coudnt Liker added to comment' });
  }
}else{
    return res.status(400).json({ Status: false, message: 'Eoror while Liker adding to comment' });
  }
}
}
 } 
}catch(err){
   console.log(err)
    return res.status(400).json({Status:'Error',Error})
  }
}

exports.getComment = async (req, res) => {
  try {
    const { post_id } = req.body;
    if (!post_id) {
      return res.status(400).json({ Status: false, message: 'Please provide all the details' });
    } else {
      console.log(post_id)
      const post_ids = new mongoose.Types.ObjectId(post_id)
      const commentaa = await comments.findOne({ post_id: post_id })
      console.log(commentaa)
      const aggregationPipeline = [
        {
          $match: { post_id: post_ids },
        },
        {
          $lookup: {
            from: 'commentreply', // The name of the replies collection
            localField: '_id', // The field to match in the comments collection
            foreignField: 'comment_id', // The field to match in the replies collection
            as: 'replies',
          },
        },
      ];

      const allComments = await comment.aggregate(aggregationPipeline).exec();

      if (allComments.length > 0) {
        const totalComments = allComments.length;

        return res.status(200).json({ Status: true, message: 'All the Comments of Post', totalComments, response: allComments });
      } else {
        return res.status(400).json({ Status: false, message: 'Could not find Any Comment For The Post' });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ Status: 'Error', Error: err });
  }
};



// exports.getComment = async (req, res) => {
//   try {
//     const { post_id } = req.body;
//     if (!post_id) {
//       return res.status(400).json({ Status: false, message: 'Please provide all the details' });
//     } else {
//       const post_ids = new mongoose.Types.ObjectId(post_id)
//       const aggregationPipeline = [
//         {
//           $match: { post_id: post_ids },
//         },
//         {
//           $lookup: {
//             from: 'commentreply',
//             localField: '_id',
//             foreignField: 'comment_id',
//             as: 'replies',
//           },
//         },
//         {
//           $lookup: {
//             from: 'citiZenUsermaster',
//             localField: 'commentdetails._id',
//             foreignField: '_id',
//             as: 'commenters',
//           },
//         },
//         {
//           $addFields: {
//             'commentdetails.profile_img': { $arrayElemAt: ['$commenters.profile_img', 0] },
//           },
//         },
//         {
//           $project: { commenters: 0 },
//         },
//       ];

//       const allComments = await comment.aggregate(aggregationPipeline).exec();

//       if (allComments.length > 0) {
//         const totalComments = allComments.length;

//         return res.status(200).json({ Status: true, message: 'All the Comments of Post', totalComments, response: allComments });
//       } else {
//         return res.status(400).json({ Status: false, message: 'Could not find Any Comment For The Post' });
//       }
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ Status: 'Error', Error: err });
//   }
// };




exports.deleteComment = async (req, res) => {
  try {
    const { comment_id, deleter_id } = req.body;
    if (!comment_id || !deleter_id) {
      return res.status(400).json({ Status: false, message: "Please provide all the details" });
    } else {
      const findToDelete = await comment.findOne({ _id: comment_id });
      const onlyReply = await replycomment.findOne({ _id: comment_id });

      if (findToDelete !== null) {
        const post_id = findToDelete.post_id;
        const poster = await post.findOne(
          { _id: post_id },
          { _id: 0, user_id: 1 }
        );
        const commentDetails = findToDelete.commentdetails;

        if (poster && commentDetails && commentDetails._id.toString() === deleter_id || poster.user_id.toString() === deleter_id) {
          const response = await comment.findOneAndDelete({ _id: comment_id });
          await replycomment.deleteMany({ comment_id: comment_id });
          await notifications.deleteMany({ comment_id: comment_id });

          const data = await comment.find({ post_id: post_id });
          const data1 = await replycomment.find({ post_id: post_id });
          const overallLength = data.length + data1.length;

          await post.findOneAndUpdate({ _id: post_id }, { $set: { totalcomments: overallLength } });

          if (response) {
            return res.status(200).json({ Status: true, message: "Comment Deleted Successfully", response });
          } else {
            return res.status(400).json({ Status: false, message: "Could not delete any comment, please try again later" });
          }
        } else {
          return res.status(400).json({ Status: false, message: "You do not have permission to delete this comment" });
        }
      } else if (onlyReply !== null) {
        const post_id = onlyReply.post_id;
        const id = onlyReply._id;

        const poster = await post.findOne(
          { _id: post_id },
          { _id: 0, user_id: 1 }
        );

        const commentDetails = onlyReply.commentdetails;

        if (poster && commentDetails && commentDetails._id.toString() === deleter_id && poster.user_id.toString() === deleter_id) {
          const response = await replycomment.findOneAndDelete({ _id: comment_id });
          await notifications.deleteMany({ replycomment_id: comment_id });

          const data1 = await replycomment.find({ post_id: post_id });
          const overallLength = data1.length;

          await post.findOneAndUpdate({ _id: post_id }, { $set: { totalcomments: overallLength } });

          if (response) {
            return res.status(200).json({ Status: true, message: "Comment Deleted Successfully", response });
          } else {
            return res.status(400).json({ Status: false, message: "Could not delete any comment, please try again later" });
          }
        } else {
          return res.status(400).json({ Status: false, message: "You do not have permission to delete this comment" });
        }
      } else {
        return res.status(400).json({ Status: false, message: "Could not find a comment to delete" });
      }
    }
  } catch (err) {
    return res.status(400).json({ Status: "Error", error: err });
  }
};
exports.sendRequestGroup=async (req, res) => {
      try {
          const { fromUser, group_id } = req.body;
          const filter = {
            $and: [
              {
                fromUser:fromUser,
                group_id:group_id
              },
              {
                requestPending: true
              }
            ]
          };
          const requestExists = await grouprequest.findOne(filter);
        if (requestExists) {
          return res.status(400).json({ status:false,message: 'Connection request already sent.' });
        }
    else{
      const result = await CreateGroup.findOne(
        { _id: group_id });
      const result1 = result.admin_id._id
      console.log("adminid",result1)
      const result2 = result.joining_group.map((item) => item._id.toString())
      console.log(result1,result2)
      if(result1){
      if (result1&&!result2.includes(fromUser)) {
        const follower = new grouprequest({
          fromUser:fromUser,
          group_id:group_id,
          requestPending: true
        });
        const response=await follower.save();
          if(follower){
        const sender1 = await citiZenUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1,mobilenumber:1});
        const sender= sender1 || await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1,mobilenumber:1});
        const profile_img=sender.profile_img
        const name=sender.firstname
        const groupcheck=await CreateGroup.findOne({_id:group_id})
        console.log(groupcheck)
        const adminids = groupcheck.admin_id._id
        console.log(adminids)
        const data=await leaderUsermaster.findOne({_id:adminids},{_id:0,token:1})
        console.log(data)
        const token =  data.token
        console.log(token);
      if(adminids){ 
        const update=await CreateGroup.findOneAndUpdate({_id:group_id},{$push:{totalrequest:sender}})
        if(update){
          const dataofgroup=await CreateGroup.findOne({_id:group_id})
          await CreateGroup.findOneAndUpdate({_id:group_id},{$set:{totalrequestcount:dataofgroup.totalrequest.length}})
          const notification = {
              title: 'ShePower',
              body: `${name} would like to join this group`,
              icon:profile_img
            };
            const data={
              page_name:'Notification'
            }
            if(notification){
              const noti=new notifications({
                user_id:result1,
                group_id:group_id,
                grouprequest_id:fromUser,
                grouprequest:notification,
                requested:true
              })
              await noti.save()
            }
          await admin.messaging().sendToDevice(token,{notification,data});
          return res.status(200).json({status:true, message: 'Connection request sent successfully',response,notification});
        }
      }
    } else{
      return res.status(400).json({ status:false,message: 'error while saving the request' });
    }
  }else{
    return res.status(400).json({ status:false,message: 'already in group' });
  }
  }else{
    return res.status(400).json({ status:false,message: 'adminID not found' });
  }
}
}catch (error) {
       console.log(error)
        return res.status(400).json({ status:false,message: 'Internal server error.' });
      }
}

exports.acceptGroupRequest=async (req, res) => {
  try {
    const { fromUser, group_id } = req.body;
    const filter = {
      $and: [
        {
          fromUser:fromUser,
          group_id:group_id
 
        },
        {
          requestPending: true
        }
      ]
    };
    const requestExists = await grouprequest.findOne(filter);
    console.log(requestExists)
    if (!requestExists) {
      return res.status(400).json({status:false, message: 'Connection request does not exist.' });
    }
 else{
    const update = { $set: { requestPending: false } };
    const accept = await connection.updateOne(filter,update);
    if(accept){
      const result = await CreateGroup.findOne(
        { _id: group_id });
      console.log(result);
      const result1 = result.admin_id._id
      const result2 = result.joining_group.map((item) => item._id.toString())
      console.log(result2)
      const groupName=result.groupName
      console.log(groupName)
    const receiver=await leaderUsermaster.findOne({_id:result1})
    const name=receiver.firstname
    const profile_img=receiver.profile_img
    const sender1 = await citiZenUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1,mobilenumber:1});
    const sender= sender1 || await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,token:1,firstname:1,mobilenumber:1});
    const id = sender._id
    console.log(id)
    const names=sender.firstname
    const token=sender.token
    const image=sender.image
    if(sender){
      if (result1&&!result2.includes(fromUser)) {
        const totalrequest=await CreateGroup.updateOne({_id:group_id},{$pull:{totalrequest:sender}})
        if(totalrequest){
          const sender1 = await citiZenUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,firstname:1,mobilenumber:1});
    const sender= sender1 || await leaderUsermaster.findOne({ _id: fromUser },{_id:1,profile_img:1,firstname:1,mobilenumber:1});
          const connection=await CreateGroup.updateOne({_id:group_id},{$push:{joining_group:sender}})
          if(connection){
            const dataofgroup=await CreateGroup.findOne({_id:group_id})
          await CreateGroup.findOneAndUpdate({_id:group_id},{$set:{totalrequestcount:dataofgroup.totalrequest.length}})
           const deleterequest= {
             title: 'ShePower',
             body: `${names} would like to join this group`,
             icon:image
           }
           await notifications.findOneAndDelete({user_id:group_id,grouprequest:deleterequest})
              const notification = {
                  title: 'ShePower',
                  body: `${name} accepted your request to join the group ${groupName}`,
                  icon:profile_img
                };
                const data={
                  page_name:'Notification'
                }
                if(notification){
                  const noti=new notifications({
                    user_id:fromUser,
                    groupaccept_id:result1,
                    group_id:group_id,
                    groupaccept:notification,
                    requested:false,
                  })
                  await noti.save()
                }
               
              await admin.messaging().sendToDevice(token,{notification,data});
              const result=await CreateGroup.findOne({_id:group_id})
        return res.status(200).json({status:true, message: `Connection request accepted successfully.`,result,notification});
      } else{
        return res.status(400).json({ status:false,message: 'something wrog while accepting' });
      }
     }else{
      return res.status(400).json({ status:false,message: 'Connection request error.' });
     }
      }  else{
        return res.status(400).json({ status:false,message: 'already in group' });
      }
 }
 }
 }
 }catch (err) {
  console.log(err)
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
exports.rejectGroupRequest = async (req, res) => {
  try {
    const { fromUser, group_id } = req.body;
    const filter = {
      $and: [
        {
          fromUser: fromUser,
          group_id: group_id,
        },
        {
          requestPending: true,
        },
      ],
    };
    const requestExists = await grouprequest.findOne(filter);

    if (!requestExists) {
      return res.status(400).json({ status: false, message: 'Connection request does not exist.' });
    } else {
      const deleteRequest = await grouprequest.findOneAndDelete(filter);

      if (deleteRequest) {
        const result = await CreateGroup.findOne({ _id: group_id });
        const result1 = result.admin_id._id;
        const result2 = result.joining_group.map((item) => item._id.toString());

        if (result1 && !result2.includes(fromUser)) {
          const deleterequest = {
            title: 'ShePower',
            body: `${deleteRequest.firstname} rejected your request to join the group ${result.groupName}`,
            icon: deleteRequest.profile_img,
          };

          await notifications.findOneAndDelete({ user_id: fromUser, grouprequest: deleterequest });

          return res.status(200).json({
            status: true,
            message: 'Connection request rejected successfully.',
            deletedRequest: deleteRequest,
          });
        } else {
          return res.status(400).json({ status: false, message: 'User is already in the group or adminID not found.' });
        }
      } else {
        return res.status(400).json({ status: false, message: 'Error while rejecting the request.' });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: 'Internal server error.' });
  }
};
exports.storeMessage=async(req,res)=>{
  try{
      const otherid=req.body.sender_id
      const name=req.body.senderName
      const msg=req.body.msg
      const roomid=req.body.room_id
      const result3=await chatModule.findOne({room_id:roomid})
      const result=await CreateGroup.findOne({room_id:roomid})
      


if(!otherid ||!name || !roomid){
  res.status(406).json({message:"sender_id ,senderName,room_id"})
}
  else if(result&&!result3){
    const result1 = result.joining_group.map((item) => item._id.toString());
const result2 = result.admin_id._id.toString()
console.log(result.mainadmin_id)
      if(result1.includes(otherid)||result2===otherid ||result.mainadmin_id===otherid){
          const store=storeMsg({
            sender_id:otherid,
            senderName:name,
            message:msg,
            room_id:roomid,
        })
        const results= await store.save();
        if(!otherid===result.mainadmin_id){
        if (results) {
const check = await leaderUsermaster.findOne({ _id: otherid }, { _id: 0, token: 1, profile_img: 1 ,firstname:1});
const check2 = check || await citiZenUsermaster.findOne({ _id: otherid}, { _id: 0, token: 1, profile_img: 1 ,firstname:1});
const result1 = result.joining_group.map((item) => item._id.toString());
const result2 = result.admin_id._id.toString()
const combined=result1.concat(result2)
            const isroomother = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:false },{sender_id:1,_id:0});
         const resultss= isroomother.map((item) => item.sender_id);
         console.log(resultss)
         const isroomother1 = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:true },{sender_id:1,_id:0});
         const resultsss= isroomother1.map((item) => item.sender_id);
         console.log(resultsss)
          if(resultss.length>0){
            const tokens1 = await leaderUsermaster.find({ _id: {$in:resultss} }, { _id: 0, token: 1});
            const tokens2 = await citiZenUsermaster.find({ _id: {$in:resultss}}, { _id: 0, token: 1 });
            const tokens=[...tokens1, ...tokens2];
            console.log(tokens)
            const token = tokens.map((item) => item.token);
            console.log(token)
            const notification = {
              title: `${check2.firstname} Sent A message`,
              body: `${msg}`,
              icon: check2.profile_img
            };
            const data = {
              type: 'Chat',
              other_id: `${otherid}`,
              name:`${check2.firstname}`
            };
            const response = await admin.messaging().sendToDevice(token, { notification, data });
  return res.status(200).send({ status: "Success", message: "Store Message Successfully", results, response });
          }else if(resultsss){
            return res.status(200).send({ status: "Success", message: "Store Message Successfully",results });
          }
        } else {
          return res.status(200).json({ status: "failure", message: "Some Technical Issue" });
        }
      }else{

        const result1 = result.joining_group.map((item) => item._id.toString());
const result2 = result.admin_id._id.toString()
const combined=result1.concat(result2)
            const isroomother = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:false },{sender_id:1,_id:0});
         const resultss= isroomother.map((item) => item.sender_id);
         console.log(resultss)
         const isroomother1 = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:true },{sender_id:1,_id:0});
         const resultsss= isroomother1.map((item) => item.sender_id);
         console.log(resultsss)
         if(resultss.length>0){
           const tokens1 = await leaderUsermaster.find({ _id: {$in:resultss} }, { _id: 0, token: 1});
           const tokens2 = await citiZenUsermaster.find({ _id: {$in:resultss}}, { _id: 0, token: 1 });
           const tokens=[...tokens1, ...tokens2];
           console.log(tokens)
           const token = tokens.map((item) => item.token);
           console.log(token)
           const notification = {
             title: `Admin Sent A message`,
             body: `${msg}`
           };
           const data = {
             type: 'Chat',
             other_id: `${otherid}`,
           };
           const response = await admin.messaging().sendToDevice(token, { notification, data });
 return res.status(200).send({ status: "Success", message: "Store Message Successfully", results, response });
         }else if(resultsss){
           return res.status(200).send({ status: "Success", message: "Store Message Successfully",results });
         }
      }
     }else{
      return res.status(400).json({stauts:"Success",message:"user not allowed to send message"})
   }
  }
 else if(result3&&!result){
      const store=storeMsg({
          sender_id:otherid,
          senderName:name,
          message:msg,
          room_id:roomid,
      })
      const result= await store.save();
      if (result) {
        const datas1=await citiZenUsermaster.findOne({ _id: otherid }, { firstname: 1, profile_img: 1 })
        const datas =  datas1 || await leaderUsermaster.findOne({ _id: otherid }, { firstname: 1, profile_img: 1 });
        const names = datas.firstname;
        const profile_img = datas.profile_img;
        const userdata = await chatModule.findOne({ room_id: roomid }, { _id: 0, sender_id: 1, other_id: 1 });
        const id = userdata.sender_id.toString();
        if (id === otherid) {
          const tokens1 = await leaderUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
          const tokens = tokens1 || await citiZenUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
          const token = tokens.token;
          const isroomother = await isRoom.findOne({ sender_id: userdata.other_id, room_id: roomid, isChatroom: true });
        if(!isroomother){
          const notification = {
            title: `${names} Sent A message`,
            body: `${msg}`,
            icon: profile_img
          };
          const data = {
            type: 'Chat',
            other_id: otherid,
            name: names
          };
          const response = await admin.messaging().sendToDevice(token, { notification, data });
return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
        }else{
          return res.status(200).send({ status: "Success", message: "Store Message Successfully", result});
        }
        } else{
          const tokens1 = await leaderUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
          const tokens = tokens1 || await citiZenUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
          const token = tokens.token;
          const isroomsender = await isRoom.findOne({ sender_id: userdata.sender_id, room_id: roomid, isChatroom: true });
          if(!isroomsender){
          const notification = {
            title: `${names} Sent A message`,
            body: `${msg}`,
            icon: profile_img
          };
          const data = {
            type: 'Chat',
            other_id: otherid,
            name: names
          };
          const response = await admin.messaging().sendToDevice(token, { notification, data });
          return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
        }else{
          return res.status(200).send({ status: "Success", message: "Store Message Successfully", result});
        }
      }
      } else {
        return res.status(200).json({ status: "failure", message: "Some Technical Issue" });
      }
   }
   else{
      return res.status(400).json({stauts:"Success",message:"user not allowed to send message"})
   }
  }
  catch(err){
      console.log(err)
      return res.status(400).send({ErrorMessage:"Somthing Wrong"})
  }
}
// exports.sendAttachment = async (req, res) => {
//   try {
//     if (!req.body.sender_id || !req.body.senderName || !req.body.room_id) {
//       return res.status(400).json({ Status: false, message: 'Please provide sender_id, senderName, room_id, and message.' });
//     }

//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ Status: false, message: 'Please select at least one file (image or video).' });
//     }
//     const otherid = req.body.sender_id;
//     const name = req.body.senderName;
//     const roomid = req.body.room_id;
//     const msg = req.body.message;

//     const result = await CreateGroup.findOne({ room_id: roomid });
//     const result2=await chatModule.findOne({room_id: roomid})
// if(result&&!result2){
//   const result1 = result.joining_group.map((item) => item._id.toString());
//   const result2 = result.admin_id._id.toString()

//     if (result2===otherid|| result1.includes(otherid)) {
//       const attachments = req.files.map((file) => file.filename);

//       const store = attachments.map((attachment) => ({
//           sender_id:otherid,
//           senderName:name,
//         room_id: roomid,
//         message:msg,
//         attachment,
//       }));

//       const response = await storeMsg.insertMany(store);

//       if (response) {
//         const check = await leaderUsermaster.findOne({ _id: otherid }, { _id: 0, token: 1, profile_img: 1 ,firstname:1});
// const check2 = check || await citiZenUsermaster.findOne({ _id: otherid}, { _id: 0, token: 1, profile_img: 1 ,firstname:1});
// const names=check2.firstname
// const profile_img=check2.profile_img
// console.log(profile_img)
//         const result1 = result.joining_group.map((item) => item._id.toString());
// const result2 = result.admin_id._id.toString()
// const combined=result1.concat(result2)
// console.log(combined)
// const isroomother = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:false },{sender_id:1,_id:0});
// const resultss= isroomother.map((item) => item.sender_id);
// console.log(resultss)
// const isroomother1 = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:true },{sender_id:1,_id:0});
// const resultsss= isroomother1.map((item) => item.sender_id);
// console.log(resultsss)
//         if(resultss.length>0){
//           const tokens1 = await leaderUsermaster.find({ _id: {$in:resultss} }, { _id: 0, token: 1});
//           const tokens2 = await citiZenUsermaster.find({ _id: {$in:resultss}}, { _id: 0, token: 1 });
//           const tokens=[...tokens1, ...tokens2];
//           console.log(tokens)
//           const token = tokens.map((item) => item.token);
//           console.log(token)
//           const notification = {
//             title: `${names} Sent A Attachment`,
//             icon: profile_img
//           };
//           const data = {
//             type: 'Chat',
//             other_id: `${otherid}`,
//             name:`${names}`
//           };
//           const result = await admin.messaging().sendToDevice(token, { notification, data });
// return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
//         }else if(resultsss){
//           return res.status(200).send({ status: "Success", message: "Store Message Successfully", response });
//         }
//       } else {
//         return res.status(200).json({ status: "failure", message: "Some Technical Issue" });
//       }
//     } else {
//       return res.status(400).json({ Status: false, message: 'You are not eligible to message here' });
//     }
// }
// else if (result2&&!result){
//   const attachments = req.files.map((file) => file.filename);

//   const store = attachments.map((attachment) => ({
//       sender_id:otherid,
//       senderName:name,
//     room_id: roomid,
//     message:msg,
//     attachment,
//   }));

//   const result = await storeMsg.insertMany(store);

//   if (result) {
//     const datas1=await citiZenUsermaster.findOne({ _id: otherid }, { firstname: 1, profile_img: 1 })
//     const datas =  datas1 || await leaderUsermaster.findOne({ _id: otherid }, { firstname: 1, profile_img: 1 });
//     const names = datas.firstname;
//     const profile_img = datas.profile_img;
//     const userdata = await chatModule.findOne({ room_id: roomid }, { _id: 0, sender_id: 1, other_id: 1 });
//     const id = userdata.sender_id.toString();
//     if (id === otherid) {
//       const tokens1 = await leaderUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
//       const tokens = tokens1 || await citiZenUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
//       const token = tokens.token;
//       const isroomother = await isRoom.findOne({ sender_id: userdata.other_id, room_id: roomid, isChatroom: true });
//     if(!isroomother){
//       const notification = {
//         title: `${names} Sent A message`,
//         body: `${msg}`,
//         icon: profile_img
//       };
//       const data = {
//         type: 'Chat',
//         other_id: otherid,
//         name: names
//       };
//       const response = await admin.messaging().sendToDevice(token, { notification, data });
// return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
//     }else{
//       return res.status(200).send({ status: "Success", message: "Store Message Successfully", result});
//     }
//     } else{
//       const tokens1 = await leaderUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
//       const tokens = tokens1 || await citiZenUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
//       const token = tokens.token;
//       const isroomsender = await isRoom.findOne({ sender_id: userdata.sender_id, room_id: roomid, isChatroom: true });
//       if(!isroomsender){
//       const notification = {
//         title: `${names} Sent A Attachment`,
//         icon: profile_img
//       };
//       const data = {
//         type: 'Chat',
//         other_id: otherid,
//         name: names
//       };
//       const response = await admin.messaging().sendToDevice(token, { notification, data });
//       return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
//     }else{
//       return res.status(200).send({ status: "Success", message: "Store Message Successfully", result});
//     }
//   }
//   } else {
//     return res.status(200).json({ status: "failure", message: "Some Technical Issue" });
//   }
// }else{
// return res.status(400).json({ Status: false, message: 'room notfound' });
// }
    
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({ Status: 'Error', Error: err.message });
//   }
// };

exports.sendAttachment = async (req, res) => {
  try {
    if (!req.body.sender_id || !req.body.senderName || !req.body.room_id) {
      return res.status(400).json({ Status: false, message: 'Please provide sender_id, senderName, room_id, and message.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ Status: false, message: 'Please select at least one file (image or video).' });
    }
    const otherid = req.body.sender_id;
    const name = req.body.senderName;
    const roomid = req.body.room_id;
    const msg = req.body.message;

    const result3 = await CreateGroup.findOne({ room_id: roomid });
    const result2=await chatModule.findOne({room_id: roomid})
if(result3&&!result2){
  const result1 = result3.joining_group.map((item) => item._id.toString());
  const result2 = result3.admin_id._id.toString()

    if (result2===otherid|| result1.includes(otherid)) {
      const attachments = req.files.map((file) => file.filename);

      const store = attachments.map((attachment) => ({
          sender_id:otherid,
          senderName:name,
        room_id: roomid,
        message:msg,
        attachment,
      }));

      const result = await storeMsg.insertMany(store);

      if (result) {
        const check = await leaderUsermaster.findOne({ _id: otherid }, { _id: 0, token: 1, profile_img: 1 ,firstname:1});
const check2 = check || await citiZenUsermaster.findOne({ _id: otherid}, { _id: 0, token: 1, profile_img: 1 ,firstname:1});
const names=check2.firstname
const profile_img=check2.profile_img
console.log(profile_img)
        const result1 = result3.joining_group.map((item) => item._id.toString());
const result2 = result3.admin_id._id.toString()
const combined=result1.concat(result2)
console.log(combined)
const isroomother = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:false },{sender_id:1,_id:0});
const resultss= isroomother.map((item) => item.sender_id);
console.log(resultss)
const isroomother1 = await isRoom.find({ sender_id: {$in:combined}, room_id: roomid, isChatroom:true },{sender_id:1,_id:0});
const resultsss= isroomother1.map((item) => item.sender_id);
console.log(resultsss)
        if(resultss.length>0){
          const tokens1 = await leaderUsermaster.find({ _id: {$in:resultss} }, { _id: 0, token: 1});
          const tokens2 = await citiZenUsermaster.find({ _id: {$in:resultss}}, { _id: 0, token: 1 });
          const tokens=[...tokens1, ...tokens2];
          console.log(tokens)
          const token = tokens.map((item) => item.token);
          console.log(token)
          const notification = {
            title: `${names} Sent A Attachment`,
            icon: profile_img
          };
          const data = {
            type: 'Chat',
            other_id: `${otherid}`,
            name:`${names}`
          };
          const response = await admin.messaging().sendToDevice(token, { notification, data });
return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
        }else if(resultsss){
          return res.status(200).send({ status: "Success", message: "Store Message Successfully", result });
        }
      } else {
        return res.status(200).json({ status: "failure", message: "Some Technical Issue" });
      }
    } else {
      return res.status(400).json({ Status: false, message: 'You are not eligible to message here' });
    }
}
else if (result2&&!result3){
  const attachments = req.files.map((file) => file.filename);

  const store = attachments.map((attachment) => ({
      sender_id:otherid,
      senderName:name,
    room_id: roomid,
    message:msg,
    attachment,
  }));

  const result = await storeMsg.insertMany(store);

  if (result) {
    const datas1=await citiZenUsermaster.findOne({ _id: otherid }, { firstname: 1, profile_img: 1 })
    const datas =  datas1 || await leaderUsermaster.findOne({ _id: otherid }, { firstname: 1, profile_img: 1 });
    const names = datas.firstname;
    const profile_img = datas.profile_img;
    const userdata = await chatModule.findOne({ room_id: roomid }, { _id: 0, sender_id: 1, other_id: 1 });
    const id = userdata.sender_id.toString();
    if (id === otherid) {
      const tokens1 = await leaderUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
      const tokens = tokens1 || await citiZenUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
      const token = tokens.token;
      const isroomother = await isRoom.findOne({ sender_id: userdata.other_id, room_id: roomid, isChatroom: true });
    if(!isroomother){
      const notification = {
        title: `${names} Sent A message`,
        body: `${msg}`,
        icon: profile_img
      };
      const data = {
        type: 'Chat',
        other_id: otherid,
        name: names
      };
      const response = await admin.messaging().sendToDevice(token, { notification, data });
return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
    }else{
      return res.status(200).send({ status: "Success", message: "Store Message Successfully", result});
    }
    } else{
      const tokens1 = await leaderUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
      const tokens = tokens1 || await citiZenUsermaster.findOne({ _id: userdata.other_id }, { _id: 0, token: 1, profile_img: 1 });
      const token = tokens.token;
      const isroomsender = await isRoom.findOne({ sender_id: userdata.sender_id, room_id: roomid, isChatroom: true });
      if(!isroomsender){
      const notification = {
        title: `${names} Sent A Attachment`,
        icon: profile_img
      };
      const data = {
        type: 'Chat',
        other_id: otherid,
        name: names
      };
      const response = await admin.messaging().sendToDevice(token, { notification, data });
      return res.status(200).send({ status: "Success", message: "Store Message Successfully", result, response });
    }else{
      return res.status(200).send({ status: "Success", message: "Store Message Successfully", result});
    }
  }
  } else {
    return res.status(200).json({ status: "failure", message: "Some Technical Issue" });
  }
}else{
return res.status(400).json({ Status: false, message: 'room notfound' });
}
    
  } catch (err) {
    console.error(err);
    return res.status(400).json({ Status: 'Error', Error: err.message });
  }
};


//--------------------------AdminNotification-------------------------
// exports.adminNotifiactionImg = async (req, res) => {
//   console.log(req.body);
//   const {Text} = req.body
//   //console.log("file",req.file ==undefined);

//   const image = req.file.filename
//   console.log(image);
//   try {
//     if (image) {
      
//       const upload = await adminNotification.create({message:Text, image:image});
//       console.log("upload--",upload);
//       const userstoken =await citiZenUsermaster.find({}, {token:1, _id:0})
//       const leadertoken =await leaderUsermaster.find({}, {token:1, _id:0})
      
//       console.log("userTokens",userstoken);
      
//       const citizentokens = userstoken.map((data) => data.token);
//       const leadertokens = leadertoken.map((data) => data.token);
      
// const tokens = [...citizentokens,...leadertokens]
//       const notification = {
//         title: `${"admin"} Sent A message`,
//         body: `${Text}`,
//         image:  image,
//       };
//       const data = {
//         type: "AdminNotification",
//         name: "ShePower",
//       };
//       const response = await admin
//           .messaging()
//           .sendToDevice(tokens, { notification, data });

//           return res.status(200).send({
//             status: "Success",
//             message: "Notification sent successfully",
//             upload,
//             response
//           });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(400).send({ ErrorMessage: "Somthing Wrong" });
//   }
// };



exports.getnotificationAdmin=async (req,res)=>{
  try{
const response=await adminNotification.find()
return res.status(200).json({
  status: true,
  message: "notification Data Fetched Successfully",
  response
});
  }catch(err){
    console.log('Error:', err);
    return res.status(500).json({ status: false, message: 'Something went wrong' });
  }
}
exports.allUserNotification = async (req, res) => {
  try {
       const {text ,title}=req.body;
      
      const userstoken = await citiZenUsermaster.find().select('token');
       const leadertoken = await leaderUsermaster.find().select('token');
       const citizentokens = userstoken.map(user => user.token).filter(token => token !== '');
       const leadertokens = leadertoken.map(user => user.token).filter(token => token !== '');
      
      const tokens = [...citizentokens, ...leadertokens]
      console.log(tokens);


      if (tokens.length === 0) { 
        return res.status(400).send({ status: false, message: 'No Users Available For Sending Notifications.' });
      }


      if(text && req.file){
       const image = req.file.filename

        

        const notification = {
          title: title,
          body: text,
          image:  image,
        };
        const data = {
          type: "AdminNotification",
          name: "ShePower",
        };
        const response = await admin
            .messaging()
            .sendToDevice(tokens, { notification, data });
            const count=response.successCount
            const upload = await adminNotification.create({message:text, image:image , title:title,count:count});
      console.log("upload--",upload);
            return res.status(200).send({
              status: "Success",
              message: "Notification sent successfully",
              upload,
              response,
              count
            });
      }else{
        if (!text) {
          return res.status(406).send({ status: false, message: 'Please Fill Notification Content' });
        }

        if (tokens.length > 0) {

          const mssg= {
            tokens: tokens, 
            notification: {
              // title: "ShePower",
              title: title,
              body:text,
            },
            data: {
              "Data": "Notification"
            }
          };
         const response = await admin.messaging().sendMulticast(mssg);
         if(mssg){
          const count=response.successCount
          console.log(count)
          const upload =new adminNotification({message:text , title:title,count:count})
          await upload.save()
          console.log(upload)
          console.log('Notification sent successfully:', response.successCount, 'successful recipients.');
          res.send({ status: true, message: 'Notification Sent To All Empower Users Successfully',response,upload,count});
      }
    }
      }
         } catch (err) {
          console.log('Registration error', err);
          return res.status(500).send({ status: false, message: err.message || 'Something went wrong' });
        }
};
// exports.allUserNotification = async (req, res) => {
//   try {
//        const {text ,title}=req.body;
      
//       const userstoken = await citiZenUsermaster.find().select('token');
//        const leadertoken = await leaderUsermaster.find().select('token');
//        const citizentokens = userstoken.map(user => user.token).filter(token => token !== '');
//        const leadertokens = leadertoken.map(user => user.token).filter(token => token !== '');
      
//       const tokens = [...citizentokens, ...leadertokens]
//       console.log(tokens);


//       if (tokens.length === 0) { 
//         return res.status(400).send({ status: false, message: 'No Users Available For Sending Notifications.' });
//       }


//       if(text && req.file){
//        const image = req.file.filename

        

//         const notification = {
//           title: `${"Admin"} Sent A message`,
//           body: `${text}`,
//           image:  image,
//         };
//         const data = {
//           type: "AdminNotification",
//           name: "ShePower",
//         };
//         const response = await admin
//             .messaging()
//             .sendToDevice(tokens, { notification, data });
//             const count=response.successCount
//             const upload = await adminNotification.create({message:text, image:image , title:title,count:count});
//       console.log("upload--",upload);
//             return res.status(200).send({
//               status: "Success",
//               message: "Notification sent successfully",
//               upload,
//               response,
//               count
//             });
//       }else{
//         if (!text) {
//           return res.status(406).send({ status: false, message: 'Please Fill Notification Content' });
//         }

//         if (tokens.length > 0) {

//           const mssg= {
//             tokens: tokens, 
//             notification: {
//               // title: "ShePower",
//               title: `${"Admin"} Sent A message`,
//               body:text,
//             },
//             data: {
//               "Data": "Notification"
//             }
//           };
//          const response = await admin.messaging().sendMulticast(mssg);
//          if(mssg){
//           const count=response.successCount
//           console.log(count)
//           const upload =new adminNotification({message:text , title:title,count:count})
//           await upload.save()
//           console.log(upload)
//           console.log('Notification sent successfully:', response.successCount, 'successful recipients.');
//           res.send({ status: true, message: 'Notification Sent To All Empower Users Successfully',response,upload,count});
//       }
//     }
//       }
//          } catch (err) {
//           console.log('Registration error', err);
//           return res.status(500).send({ status: false, message: err.message || 'Something went wrong' });
//         }
// };
exports.citizenNotification = async (req, res) => {
  try {
       const {text ,title}=req.body;
      
      const userstoken = await citiZenUsermaster.find().select('token');
       const citizentokens = userstoken.map(user => user.token).filter(token => token !== '');
      
      const tokens = [...citizentokens]
      console.log(tokens);


      if (tokens.length === 0) { 
        return res.status(400).send({ status: false, message: 'No Users Available For Sending Notifications.' });
      }


      if(text && req.file){
       const image = req.file.filename


        const notification = {
          title: `${"Admin"} Sent A message`,
          body: `${text}`,
          image:  image,
        };
        const data = {
          type: "AdminNotification",
          name: "ShePower",
        };
        const response = await admin
            .messaging()
            .sendToDevice(tokens, { notification, data });
            const count=response.successCount
            
        const upload = await adminNotification.create({message:text, image:image , title:title,count:count});
      console.log("upload--",upload);
            return res.status(200).send({
              status: "Success",
              message: "Notification sent successfully",
              upload,
              response,
              count
            });


      }else{
        if (!text) {
          return res.status(406).send({ status: false, message: 'Please Fill Notification Content' });
        }

        if (tokens.length > 0) {

          const mssg= {
            tokens: tokens, 
            notification: {
             title: "ShePower",
              title: `${"Admin"} Sent A message`,
              body:text,
            },
            data: {
              "Data": "Notification"
            }
          };
         const response = await admin.messaging().sendMulticast(mssg);
         if(mssg){
          const count=response.successCount
          const upload =new adminNotification({message:text , title:title,count:count})
          await upload.save()
          console.log(upload)
          
          console.log('Notification sent successfully:', response.successCount, 'successful recipients.');
          res.send({ status: true, message: 'Notification Sent To All Empower Users Successfully',response,count,upload});
      
         }
      }
    }
         } catch (err) {
          console.log('Registration error', err);
          return res.status(500).send({ status: false, message: err.message || 'Something went wrong' });
        }
};
exports.leaderNotification = async (req, res) => {
  try {
       const {text ,title}=req.body;
      
       const leadertoken = await leaderUsermaster.find().select('token');
       const leadertokens = leadertoken.map(user => user.token).filter(token => token !== '');
      
      const tokens = [ ...leadertokens]
      console.log(tokens);


      if (tokens.length === 0) { 
        return res.status(400).send({ status: false, message: 'No Users Available For Sending Notifications.' });
      }


      if(text && req.file){
       const image = req.file.filename

       

        const notification = {
          title: `${"Admin"} Sent A message`,
          body: `${text}`,
          image:  image,
        };
        const data = {
          type: "AdminNotification",
          name: "ShePower",
        };
        const response = await admin
            .messaging()
            .sendToDevice(tokens, { notification, data });
  const count=response.successCount
  const upload = await adminNotification.create({message:text, image:image , title:title,count:count});
  console.log("upload--",upload);
            return res.status(200).send({
              status: "Success",
              message: "Notification sent successfully",
              upload,
              response,
              count
            });


      }else{
        if (!text) {
          return res.status(406).send({ status: false, message: 'Please Fill Notification Content' });
        }

        if (tokens.length > 0) {

          const mssg= {
            tokens: tokens, 
            notification: {
             title: "ShePower",
              title: `${"Admin"} Sent A message`,
              body:text,
            },
            data: {
              "Data": "Notification"
            }
          };
         const response = await admin.messaging().sendMulticast(mssg);
         if(mssg){
          const count=response.successCount
          const upload =new adminNotification({message:text , title:title,count:count})
          await upload.save()
          console.log(upload)
        
          console.log('Notification sent successfully:', response.successCount, 'successful recipients.');
        
          res.send({ status: true, message: 'Notification Sent To All Empower Users Successfully',response, count,upload});
      }
    }
      }
         } catch (err) {
          console.log('Registration error', err);
          return res.status(500).send({ status: false, message: err.message || 'Something went wrong' });
        }
};
exports.acceptSos=async(req,res)=>{
  try{
    const {sosId,leader_id}=req.body 
    if(!sosId){
      return res.status(400).json({ Status: false, message: "please provide Id" });
    }else{
      const partner1 = await leaderUsermaster.findOne (
        { _id:leader_id},
        { firstname: 1, mobilenumber: 1, _id: 1, profile_img: 1,token:1 }
      );
      const name=partner1.firstname
      const profile_img=partner1.profile_img
      console.log(partner1)
      if(partner1){
        const check=await sosSchema.findOne({sosId:sosId,"accptedleader._id":partner1._id})
        console.log(check)
        if(!check){
          const resul=await sosSchema.findOneAndUpdate({sosId:sosId},{$push:{accptedleader:partner1}})
          if(resul){
            const result=await sosSchema.findOne({sosId:sosId}) 
          const datas=await sosSchema.findOne({sosId:sosId})
          const user_id=datas.user_id._id
          const token=datas.user_id.token
            const notification = {
              title: 'shePower',
              body: `${name} accpted your sos request `,
              icon:profile_img
            };
            const data={
              page_name:'Notification'
            }
              
            const noti=new notifications({
              user_id:user_id,
              sosAccept:notification,
              sosId:result.sosId
            })
            await noti.save()
            const response=await admin.messaging().sendToDevice(token,{notification,data});
            
            
            return res.status(200).json({ Status: true, message: "leaders accepted sos successfully", result ,response});
          }else{
            return res.status(400).json({ Status: false, message: "CouldNot find any sos" });
          }
        }else{
          return res.status(400).json({ Status: false, message: "already accepted" });
        }
     
    } else{
      return res.status(400).json({ Status: false, message: "Only citizen can close the case" });
    }
  }
}catch (err) {
      console.log('find error', err);
      return res.status(500).send({ status: false, message: err.message || 'Something went wrong' });
    }
}
exports.closeSos= async (req,res) =>{
  try{
    const {sosId,citizen_id}=req.body 
    if(!sosId){
      return res.status(400).json({ Status: false, message: "please provide Id" });
    }else{
      const id=new mongoose.Types.ObjectId(citizen_id)
      const data=await sosSchema.findOne({sosId:sosId,"user_id._id":id})
      const name=data.user_id.firstname
      const profile_img=data.user_id.profile_img
      const token = data.leaders.map(leader => leader.token);
      console.log(token)
      const ids = data.leaders.map(leader => leader._id);
      console.log(ids)
      if(data){
        const check=await sosSchema.findOne({sosId:sosId,closed:true})
        if(!check){
          const resul=await sosSchema.findOneAndUpdate({sosId:sosId},{$set:{closed:true}})
        if(resul){
          const result=await sosSchema.findOne({sosId:sosId}) 
            const notification = {
              title: 'shePower',
              body: `${name} closed Sos `,
              icon:profile_img
            };
            const data={
              page_name:'Notification'
            }
            for (const id of ids) {
              const noti = new notifications({
                user_id: id,
                sosClosed: notification,
                sosId: result.sosId,
                closedorNot: result.closed,
              });
            
              await noti.save();
            }
            const response=await admin.messaging().sendToDevice(token,{notification,data});
         
          return res.status(200).json({ Status: true, message: "sos closed successful", result,response });
        }else{
          return res.status(400).json({ Status: false, message: "CouldNot find any sos" });
        }
      }else{
        return res.status(400).json({ Status: false, message: "you have already closed the case" });
      }
    } else{
      return res.status(400).json({ Status: false, message: "Only citizen can close the case" });
    }
  }
}catch (err) {
      console.log('find error', err);
      return res.status(500).send({ status: false, message: err.message || 'Something went wrong' });
    }
}

exports.SplashScreen = async (req, res) => {
  try{
  const  {_id} = req.body
  if(!_id){
    return res.status(400).send({Status:400,message:'no user Availble'})
  }else{
  
    const respons1 = await citiZenUsermaster.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        },
      },
      {
        $lookup: {
          from: "logoutchecks",
          localField: "_id",
          foreignField: "user_id",
          as: "checkout"
        }
      }
    ]);
    const respons = await leaderUsermaster.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        },
      },
      {
        $lookup: {
          from: "logoutchecks",
          localField: "_id",
          foreignField: "user_id",
          as: "checkout"
        }
      }
    ]);
    const response = respons1.concat(respons);
    console.log(response);
  if(response){
    return res.status(200).send({Status:200,message:'Data fetched Successfully',response})
    }else{
      return res.status(400).send({Status:400,message:'no data'})
    }
}
}catch(err){
  console.log(err)
return res.status(400).send({Status:400,message:'somthing went wrong'})
}
}
 exports.logoutCheck=async(req,res)=>{
  try{
    const{user_id}=req.body
    if(!user_id){
      return res.status(400).send({Status:400,message:'Please Provide ID'})
    }else{
      const response=await locgoutCheck.findOne({user_id:user_id})
      if(response){
        console.log(response)
        const newdevice_id=response.newdevice_id
        const Olddevice_id=response.Olddevice_id
        if(newdevice_id===Olddevice_id){
        return res.status(200).send({Status:200,message:'Device id is matched',response})
      }else{
        return res.status(400).send({Status:400,message:'Device id is not matched',response})
      }
    }
  }
  }catch(err){
 console.log(err)
 return res.status(400).send({Status:400,message:'somthing went wrong'})
}
}
exports.deeplink = async (req, res) => {
  try {
    const link = req.body.link; 
    const _id = req.body._id; 
    const androidPackageName = 'com.example.empower'; 
    const apikey = 'AIzaSyDhIAItooqr1WYbbNYucnyveCR73nm2iak'; 
    const url = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apikey}`;
    
    const response = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'},

body: JSON.stringify({dynamicLinkInfo: {domainUriPrefix: 'https://shepower.page.link',link: link,
androidInfo: {androidPackageName: androidPackageName,androidFallbackLink: 'https://play.google.com/store/apps/'
          },
socialMetaTagInfo: {socialTitle: 'Check out this link!',socialDescription: 'This is the description of the link',},
        },
        suffix: {
          option: 'SHORT',
        },
      }),
    });
   const data = await response.json();
 
    
    res.json({Status:true,message:"deep link created",shortLink: data.shortLink,_id: _id,});
  } catch (error) {
    console.log(error)
    res.status(500).json({message: 'An error occurred while generating the Dynamic Link.',
    });
  }
} 


exports.createSos = async (req, res) => {
  try {
    const { citizen_id, latitude, longitude, text , types_of_danger, local_Police_Helpline } = req.body;



    console.log("data" , types_of_danger);
    const senderLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    
    const citizenObjectId = new mongoose.Types.ObjectId(citizen_id);
    if (!mongoose.Types.ObjectId.isValid(citizenObjectId)) {
      return res.status(400).json({ status: false, message: "Invalid citizen_id format" });
    }

    


    const partner2 = await citiZenUsermaster.findOne(
      { _id: citizenObjectId },
      { firstname: 1, mobilenumber: 1, _id: 1, profile_img: 1, token: 1 }
    );
    
    
    const names = partner2.firstname;
    const profile_img = partner2.profile_img;
    
    console.log(names, profile_img);
    
    const partnerData = await locations
      .find({
        "location.latitude": {
          $gte: senderLocation.latitude - 0.045,
          $lte: senderLocation.latitude + 0.045,
        },
        "location.longitude": {
          $gte: senderLocation.longitude - 0.045,
          $lte: senderLocation.longitude + 0.045,
        },
        user_id: { $ne: "" },
      })
      .sort({ _id: -1 });


      console.log("partner Data" ,  partnerData);
      

    const partnerDataUserIds = partnerData.map((partner) => partner.user_id);
    const randomNumber = Math.floor(Math.random() * 1000000);
    const profileID = `sos${randomNumber}`;
    console.log("{{{{{{{{{{{{{{",profileID);

    const tokens = partnerData.map((partner) => partner.user_id._id);
    console.log("{{{{{{{{{{{{{ tokes",tokens);

    

    const notification = {
      title: "ShePower",
      body: `${names} is in Danger`,
      icon: profile_img,
    };
    const data = {
      page_name: "Notification",
    };

    // const response = await admin
    //   .messaging()
    //   .sendToDevice(tokens, { notification, data });

      // console.log("{{{{{{{{{{{{{{{{{{{{{{",response);
    let result;
    if (req.file) {
      const attachment = req.file.filename;
      console.log(attachment);
      const sosSchemas = new sosSchema({
        user_id: partner2,
        location: {
          latitude: latitude,
          longitude: longitude,
        },
        attachment: attachment,
        text: text,
        leaders: partnerDataUserIds,
        sosId: profileID,
        // notificationCount: response.successCount,
        types_of_danger: types_of_danger,
        local_Police_Helpline: local_Police_Helpline,
      });
      result = await sosSchemas.save();
      console.log(result);
    } else {
      const sosSchemas = new sosSchema({
        user_id: partner2,
        location: {
          latitude: latitude,
          longitude: longitude,
        },
        text: text,
        leaders: partnerDataUserIds,
        sosId: profileID,
        types_of_danger: types_of_danger,
        local_Police_Helpline: local_Police_Helpline,
        // notificationCount: response.successCount,
      });
      result = await sosSchemas.save();
      console.log(result);
    }
    const notificationsToInsert = partnerData.map((partner) => ({
      sosNotification: notification,
      user_id: partner.user_id._id,
      sosId: result.sosId,
      closedorNot: result.closed,
    }));
    const notifyme = notifications.insertMany(notificationsToInsert);
    console.log(notifyme);
    return res.status(200).json({
      status: true,
      message: "Sos created successfully",
      partnerData,
      result,
      // response,
    });
  } catch (err) {
    console.log("Error:", err);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong"  , err});
  }
};



const schedule = require('node-schedule');

exports.findleaders = async (req, res) => {
  try {
    const { sosId } = req.body;
    if (!sosId) {
      return res.status(400).send({ Status: 400, message: 'Please provide SOS ID' });
    } else {
      const data = await sosSchema.findOne({ sosId: sosId ,closed:false});
      console.log('data-->',data.accptedleader && data.accptedleader.length === 0);

      if (!data.accptedleader || (data.accptedleader && data.accptedleader.length === 0)) {
        const latitude = data.location.latitude;
        const longitude = data.location.longitude;
        const senderLocation = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        };
        const profile_img=data.profile_img || ""
        const sendNotificationsAndUpdate = async (partnerData, latitudeRange, longitudeRange) => {
          const tokens = partnerData.map((partner) => partner.user_id.token);
          console.log(tokens);
          const notification = {
            title: 'ShePower',
            body: `${data.firstname} is in Danger`,
            icon: profile_img
          };
          const notificationData = {
            page_name: 'Notification'
          };
          const update = await sosSchema.findOneAndUpdate({ sosId: sosId }, { $set: { leaders: partnerData, locationRange: { latitude: latitudeRange, longitude: longitudeRange } } });
          const response = await admin.messaging().sendToDevice(tokens, { notification, data: notificationData });
          console.log(response);
          const notificationsToInsert = partnerData.map((partner) => ({
            sosNotification: notification,
            user_id: partner.user_id._id,
            sosId: sosId,
            closedorNot: data.closed
          }));
          const notifyme = await notifications.insertMany(notificationsToInsert);
          console.log(notifyme);
        };
        const fetchPartnerData = async (latitudeRange, longitudeRange) => {
          return await locations.find({
            "location.latitude": {
              $gte: senderLocation.latitude - latitudeRange,
              $lte: senderLocation.latitude + latitudeRange,
            },
            "location.longitude": {
              $gte: senderLocation.longitude - longitudeRange,
              $lte: senderLocation.longitude + longitudeRange,
            },
            user_id: { $ne: "" }
          }).sort({ _id: -1 });
        };
const newData = await sosSchema.findOne({ sosId: sosId });
let job; // Define job variable outside of the if block
if (!newData.accptedleader || (newData.accptedleader && newData.accptedleader.length === 0)) {
    job = schedule.scheduleJob('*/1 * * * *', async () => { // Assign job within the if block
        let partnerData = await fetchPartnerData(0.09, 0.09);
        await sendNotificationsAndUpdate(partnerData, 0.15, 0.15);
        setTimeout(async () => {
            job.cancel(); // Stop the first job after 1 minute
            const nextJob = schedule.scheduleJob('*/1 * * * *', async () => {
                let partnerData = await fetchPartnerData(0.15, 0.15);
                await sendNotificationsAndUpdate(partnerData, 0.20, 0.20);
                setTimeout(() => nextJob.cancel(), 60000); // Stop the second job after 1 minute
            });
        }, 60000); // 1 minute in milliseconds
    });
} else {
    if (job) {
        job.cancel(); // Cancel the job if it was created
    }
}
        
        res.status(200).send({ Status: 200, message: 'Job scheduled successfully' });
     
     } else {
        res.status(200).send({ Status: 200, message: 'Accepted leader present, no action required' });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ Status: 400, message: 'Something went wrong' });
  }
};
