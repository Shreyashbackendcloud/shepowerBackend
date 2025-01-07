const leaderUsermaster=require('../models/registrationleader')
const citiZenUsermaster=require('../models/registrationcitizen')
const jwtTokenService = require('../services/jwt-service')
const post=require("../models/posts")
const { Client } = require('@googlemaps/google-maps-services-js');
const connection = require('../models/connection');
const request=require('../models/requests')
const Languages = require ('../models/language')
const notifications=require('../models/notification')
const mongoose=require('mongoose')
const RatingsReviews = require('../models/ratingsReviews')
const Razorpay = require('razorpay');
const Refund = require ('../models/refund')
const Order = require('../models/order');
const Customer = require('../models/customer');
const sosSchema=require('../models/sos');
const comment=require('../models/comments');
const replycomment = require('../models/replycomment');
const replycommentSos = require('../models/replycommentSos');
const CommentSos = require('../models/commentSos') 
const likespost=require('../models/likespost')
const {CreateGroup}=require('../models/groupChatmodule')
const grouprequest=require('../models/grouprequests')


const razorpayGlobalInstance  = new Razorpay({
  key_id: 'rzp_test_1d8Uz0Rqn101Hj',
  key_secret: 'DREkz3zAKcStej7cslGOdYLy',
});

const customerMap = new Map();

exports.createProfileCitizen = async (req, res) => {
  try {
    const {
      _id,
      lastname,
      firstname,
      email,
      mobileNumber,
      dob,
      education,
      proffession,
      familymembers,
      languages,
      movies,
      music,
      books,
      dance,
      sports,
      otherintrests,
      location,
    } = req.body;

    if (!_id ) {
      return res.status(401).json({ status: true, message: "Please provide all the details" });
    }
    const razorpayInstanceLocal = new Razorpay({
      key_id: 'rzp_test_1d8Uz0Rqn101Hj',
      key_secret: 'DREkz3zAKcStej7cslGOdYLy',
    });

    const customersList = await razorpayInstanceLocal.customers.all();

    const isExistingCustomer = customersList.items.some(
      (customer) => customer.contact !== mobileNumber && customer.name === `${firstname} ${lastname}`
    );

    if (isExistingCustomer) {
      return res.status(400).json({ status: false, message: "Customer with the same name already registered with a different mobile number" });
    }

    let razorpayCustomer = customerMap.get(`${firstname}_${lastname}_${mobileNumber}`);

    if (!razorpayCustomer) {
      try {
        const newCustomer = await razorpayInstanceLocal.customers.create({
          name: `${firstname} ${lastname}`,
          contact: mobileNumber,
        });
        razorpayCustomer = newCustomer.id;
        console.log("newcustomer", newCustomer);
        // Store the customer_id in the mapping for future use
        customerMap.set(`${firstname}_${lastname}_${mobileNumber}`, razorpayCustomer);
      } catch (error) {
        // Handle errors as before
      }
    }

    const randomNumber = Math.floor(Math.random() * 1000000);
    const profileID = `citizen${randomNumber}`;
    console.log(profileID);

    const check = await citiZenUsermaster.updateOne(
      { _id: _id },
      {
        $set: {
          location: location,
          firstname: firstname,
          lastname: lastname,
          email: email,
          dob: dob,
          education: education,
          proffession: proffession,
          profileID: profileID,
          customer_Id: razorpayCustomer,
        },
      },
      { new: true }
    );

    const check1 = await citiZenUsermaster.findOneAndUpdate(
      { _id: _id },
      {
        $push: {
          familymembers: { $each: familymembers },
          languages: { $each: languages },
          "areaofintrest.movies": { $each: movies },
          "areaofintrest.music": { $each: music },
          "areaofintrest.books": { $each: books },
          "areaofintrest.dance": { $each: dance },
          "areaofintrest.sports": { $each: sports },
          "areaofintrest.otherintrests": { $each: otherintrests },
        },
      }
    );

    if (check && check1) {
      await citiZenUsermaster.findOneAndUpdate({ _id: _id }, { $set: { profile: true } });
      const response = await citiZenUsermaster.findOne({ _id: _id });
      return res.status(200).json({ status: true, message: "Profile created successfully", response });
    } else {
      return res.status(401).json({ status: false, message: "Could not create a profile, try later" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ Status: 'Error', message: 'Something went wrong' });
  }
};


const leaderCustomerMap = new Map();

exports.createProfileLeader = async (req, res) => {
  try {
    const {
      _id,
      lastname,
      firstname,
      email,
      mobileNumber, 
      dob,
      education,
      proffession,
      familymembers,
      languages,
      movies,
      music,
      books,
      dance,
      sports,
      otherintrests,
      location,
    } = req.body;

    if (!_id ) {
      return res.status(401).json({ status: false, message: "Please provide all the details" });
    }


    const existingCustomerKey = Array.from(leaderCustomerMap.keys()).find(
      key => key.startsWith(`${firstname}_${lastname}`)
    );

    if (existingCustomerKey) {
      return res.status(400).json({ status: false, message: "Customer with the same name already registered" });
    }

    const razorpayInstanceLocal = new Razorpay({
      key_id: 'rzp_test_1d8Uz0Rqn101Hj',
      key_secret: 'DREkz3zAKcStej7cslGOdYLy',
    });

    let razorpayCustomer;

    try {
      const newCustomer = await razorpayInstanceLocal.customers.create({
        name: `${firstname} ${lastname}`,
        contact: mobileNumber, 
      });
      razorpayCustomer = newCustomer.id;
      console.log("newcustomer", newCustomer);

      // Store the customer_id in the mapping for future use
      leaderCustomerMap.set(`${firstname}_${lastname}_${mobileNumber}`, razorpayCustomer);
    } catch (error) {
      if (error.statusCode === 400 && error.error.code === 'BAD_REQUEST_ERROR') {
        console.log("Customer already exists:", error.error.description);
        razorpayCustomer = error.error.metadata.customer_id;
      } else {
        console.error("Error creating Razorpay customer:", error);
        return res.status(500).json({ status: false, message: "Error creating Razorpay customer" });
      }
    }

    const randomNumber = Math.floor(Math.random() * 1000000);
    const profileID = `Leader${randomNumber}`;
    console.log(profileID);

    const check = await leaderUsermaster.updateOne(
      { _id: _id },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          dob: dob,
          education: education,
          proffession: proffession,
          profileID: profileID,
          location: location,
          customer_Id: razorpayCustomer,
        },
      },
      { new: true }
    );

    const check1 = await leaderUsermaster.findOneAndUpdate(
      { _id: _id },
      {
        $push: {
          familymembers: { $each: familymembers },
          languages: { $each: languages },
          "areaofintrest.movies": { $each: movies },
          "areaofintrest.music": { $each: music },
          "areaofintrest.books": { $each: books },
          "areaofintrest.dance": { $each: dance },
          "areaofintrest.sports": { $each: sports },
          "areaofintrest.otherintrests": { $each: otherintrests },
        },
      }
    );

    if (check && check1) {
      await leaderUsermaster.findOneAndUpdate({ _id: _id }, { $set: { profile: true } });
      const response = await leaderUsermaster.findOne({ _id: _id });
      return res.status(200).json({ status: true, message: "Profile created successfully", response });
    } else {
      return res.status(401).json({ status: false, message: "Could not create a profile, try later" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ Status: 'Error', message: 'Something went wrong' });
  }
};



exports.createProfileConselingWithSos = async (req, res) => {
  try {
    const {
      _id,
      lastname,
      firstname,
      email,
      mobileNumber, 
      dob,
      education,
      proffession,
      familymembers = [],
      languages = [],
      movies = [ ],
      music = [],
      books = [],
      dance = [],
      sports = [],
      otherintrests = [],
      location,
      // Add the image URLs to be saved in the database
      // id_card,
      // address_proof,
      // certificate_ngo_or_institute,
    } = req.body;

    
    
    if (!_id) {
      return res.status(401).json({ status: false, message: "Please provide all the details" });
    }

    const existingCustomerKey = Array.from(leaderCustomerMap.keys()).find(
      key => key.startsWith(`${firstname}_${lastname}`)
    );

    if (existingCustomerKey) {
      return res.status(400).json({ status: false, message: "Customer with the same name already registered" });
    }

    const razorpayInstanceLocal = new Razorpay({
      key_id: 'rzp_test_1d8Uz0Rqn101Hj',
      key_secret: 'DREkz3zAKcStej7cslGOdYLy',
    });

    let razorpayCustomer;

    try {
      const newCustomer = await razorpayInstanceLocal.customers.create({
        name: `${firstname} ${lastname}`,
        contact: mobileNumber,
      });
      razorpayCustomer = newCustomer.id;
      console.log("newcustomer", newCustomer);

      // Store the customer_id in the mapping for future use
      leaderCustomerMap.set(`${firstname}_${lastname}_${mobileNumber}`, razorpayCustomer);
    } catch (error) {
      if (error.statusCode === 400 && error.error.code === 'BAD_REQUEST_ERROR') {
        console.log("Customer already exists:", error.error.description);
        razorpayCustomer = error.error.description;
      } else {
        console.error("Error creating Razorpay customer:", error);
        return res.status(500).json({ status: false, message: "Error creating Razorpay customer" });
      }
    }

    const randomNumber = Math.floor(Math.random() * 1000000);
    const profileID = `Leader${randomNumber}`;
    console.log(profileID);

    const check = await leaderUsermaster.updateOne(
      { _id: _id },
      {
        $set: {
          firstname: firstname,
          lastname: lastname,
          email: email,
          dob: dob,
          education: education,
          proffession: proffession,
          profileID: profileID,
          location: location,
          customer_Id: razorpayCustomer,
          id_card: {
            front: req.originalImagePaths?.["id_card.front"] ,// Directly using the uploaded URL
            back: req.originalImagePaths?.["id_card.back"]   // Directly using the uploaded URL
          },
          address_proof: {
            front: req.originalImagePaths?.["address_proof.front"], // Directly using the uploaded URL
            back: req.originalImagePaths?.["address_proof.back"]  // Directly using the uploaded URL
          },
          certificate_ngo_or_institute: {
            front: req.originalImagePaths?.["certificate_ngo_or_institute.front"], // Directly using the uploaded URL
            back: req.originalImagePaths?.["certificate_ngo_or_institute.back"]  // Directly using the uploaded URL
          },
        },
      },
      { new: true }
    );

    const check1 = await leaderUsermaster.findOneAndUpdate(
      { _id: _id },
      {
        $push: {
          familymembers: { $each: familymembers   || []},
          languages: { $each: languages  || []},
          "areaofintrest.movies": { $each: movies || [] },
          "areaofintrest.music": { $each: music  || [ ]},
          "areaofintrest.books": { $each: books || [] },
          "areaofintrest.dance": { $each: dance  || []},
          "areaofintrest.sports": { $each: sports  || []},
          "areaofintrest.otherintrests": { $each: otherintrests || [] },
        },
      }
    );

    if (check && check1) {
      await leaderUsermaster.findOneAndUpdate({ _id: _id }, { $set: { profile: true } });
      const response = await leaderUsermaster.findOne({ _id: _id });
      return res.status(200).json({ status: true, message: "Profile created successfully", response });
    } else {
      return res.status(401).json({ status: false, message: "Could not create a profile, try later" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).send({ Status: 'Error', message: 'Something went wrong' });
  }
};




exports.createProfileCitizenimg = async (req, res) => {
  try {
      const { _id } = req.body;
      if (!_id) {
          res.status(401).json({ status: false, message: "please provide all the details" });
      } else {
          const check = await citiZenUsermaster.findOneAndUpdate({ _id: _id }, { $set: { profile_img: req.file.filename } });
          if (check) {
              const response = await citiZenUsermaster.findOne({ _id: _id });
              return res.status(200).json({ status: true, message: "profile created successfully", response });
          } else {
              return res.status(401).json({ status: false, message: "could not create a profile, try later" });
          }
      }
  } catch (err) {
      console.log(err);
      return res.status(400).send({ Status: 'Error', message: 'something went wrong' });
  }
};

exports.createProfileLeaderimg = async (req, res) => {
  try {
      const { _id } = req.body;
      if (!_id) {
          res.status(401).json({ status: false, message: "please provide all the details" });
      } else {
          const check = await leaderUsermaster.findOneAndUpdate({ _id: _id }, { $set: { profile_img: req.file.filename } });
          if (check) {
              const response = await leaderUsermaster.findOne({ _id: _id });
              return res.status(200).json({ status: true, message: "profile created successfully", response });
          } else {
              return res.status(401).json({ status: false, message: "could not create a profile, try later" });
          }
      }
  } catch (err) {
      console.log(err);
      return res.status(400).send({ Status: 'Error', message: 'something went wrong' });
  }
};
exports.getAllProfile=async(req,res)=>{
  try{
   
      const result1 = await leaderUsermaster.find({profile:true})
      const result2=await citiZenUsermaster.find({profile:true})
      const result = [...result1, ...result2];
               return res.status(200).json({Status:true,message:'profile fetched successfully',result})
}catch(err){
      console.log(err)
       return res.status(400).json({Status:'Error',Error})
    }
}
exports.getOtherprofile = async (req, res) => {
  try {
    const { _id, viewer_id } = req.body;

    if (_id&&viewer_id) {
      const result = await leaderUsermaster.findOne({_id:_id});
      
      const result1=await  citiZenUsermaster.findOne({_id:_id})
      const id= new mongoose.Types.ObjectId(_id)
      const groupCount = await CreateGroup.countDocuments({ "admin_id._id": id });
      if(result){
        const ordramount = await Order.aggregate([
          {
            $match: { customer_Id: result.customer_Id } 
          },
          {
            $group: {
              _id: null, 
              totalAmount: { $sum: "$amount" } 
            }
          },
          {
            $project: { _id: 0, totalAmount: 1 } 
          }
        ]);
        const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
        console.log(overallAmount)
        const isprivate=result.private
          const isConnected=result.connected
          const isPublic=result.public
          const blockedIds=result.blockContact
          const connectedppl=await connection.findOne({user_id:_id})
            const connectedids=connectedppl?.connections?.map(connection => connection._id) || []
   const connectIdsStr= connectedids.map(id => id.toString());
   console.log(connectIdsStr)
   const connectIdsStrs=await citiZenUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
   const connectIdsStrss= connectIdsStrs.map(doc => doc._id.toString());
   const connectIdsStrsl=await leaderUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
   const connectIdsStrssl= connectIdsStrs.map(doc => doc._id.toString());
   if(blockedIds.includes(viewer_id)){
    return res.status(400).json({status:false,message:'cant view profile'})
   }else  if(isprivate===true){
    return res.status(400).json({status:false,message:'This is an Private Account'})
 }else if(!isprivate===true&&connectIdsStr.includes(viewer_id)){
  const postimages = await post.find(
    { user_id: { $eq: _id } },
    { _id: 0, Post_img: 1 }
  );
  const posts = postimages.length;
  const count = await connection.findOne(
    { user_id: _id },
    { _id: 0, connections: 1 }
  );

  const connect = count ? count.connections : [];
  const data = await citiZenUsermaster.findOne(
    { _id: viewer_id },
    { _id: 1, token: 1, firstname: 1, profile_img: 1 }
  );
  const data1 = await leaderUsermaster.findOne(
    { _id: viewer_id },
    { _id: 1, token: 1, firstname: 1, profile_img: 1 }
  );
  const connections = connectIdsStrss.length;
  const filter = {
    $and: [
      {
        fromUser: viewer_id,
        toUser: _id,
      },
      {
        requestPending: true,
      },
    ],
  };
  const requestExists = await request.findOne(filter);
  const allRatings = await RatingsReviews.find({ leader_id: _id }, { _id: 0, leader_id: 1, trustWorthy: 1,knowledgeable:1,helpul:1,
    available:1,courageous:1,efficient:1 });
  const trustWorthy = allRatings.reduce((acc, curr) => acc + (curr.trustWorthy || 0), 0);
    const trustWorthyRate = allRatings.length > 0 ? trustWorthy / allRatings.length : null;
    
    const knowledgeable = allRatings.reduce((acc, curr) => acc + (curr.knowledgeable || 0), 0);
    const knowledgeableRate = allRatings.length > 0 ? knowledgeable / allRatings.length : null;
    
    const helpful = allRatings.reduce((acc, curr) => acc + (curr.helpful || 0), 0);
    const helpfulRate = allRatings.length > 0 ? helpful / allRatings.length : null;
    
    const available = allRatings.reduce((acc, curr) => acc + (curr.available || 0), 0);
    const availableRate = allRatings.length > 0 ? available / allRatings.length : null;
    
    const courageous = allRatings.reduce((acc, curr) => acc + (curr.courageous || 0), 0);
    const courageousRate = allRatings.length > 0 ? courageous / allRatings.length : null;
    
    const efficient = allRatings.reduce((acc, curr) => acc + (curr.efficient || 0), 0);
    const efficientRate = allRatings.length > 0 ? efficient / allRatings.length : null;
    
    let totalSum = 0;
    let totalCount = 0;
    
    allRatings.forEach(rating => {
        totalSum += trustWorthyRate + knowledgeableRate + helpfulRate + availableRate + courageousRate + efficientRate;
        totalCount += 6; 
    });
    
    // Calculate overall average rating
    const overallAverageRating = totalSum / totalCount;
   
    console.log("Overall average rating:", overallAverageRating);
  if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
    if (result) {
      return res.status(200).json({
        Status: true,
        message: "profile fetched successfully",
        result,
        connections,
        posts,
        postimages,
        isConnected: true,
        requestExists: requestExists ? true : false,
        overallAverageRating,
        groupCount,
        overallAmount
      });
    } else {
      return res
        .status(400)
        .json({ Status: false, message: "error " });
    }
  } else {
    if (result) {
      return res.status(200).json({
        Status: true,
        message: "profile fetched successfully",
        result,
        connections,
        posts,
        postimages,
        isConnected: false,
        requestExists: requestExists ? true : false,
        overallAverageRating,
        groupCount,
        overallAmount
      });
    } else {
      return res
        .status(400)
        .json({ Status: false, message: "error " });
    }
  }
 }else if(isPublic===true){
  const postimages = await post.find(
    { user_id: { $eq: _id } },
    { _id: 0, Post_img: 1 }
  );
  const posts = postimages.length;
  const count = await connection.findOne(
    { user_id: _id },
    { _id: 0, connections: 1 }
  );
  const connections = connectIdsStrss.length
  
  const connect = count ? count.connections : [];

  const data = await citiZenUsermaster.findOne(
    { _id: viewer_id },
    { _id: 1, token: 1, firstname: 1, profile_img: 1 }
  );
  const data1= await leaderUsermaster.findOne(
    { _id: viewer_id },
    { _id: 1, token: 1, firstname: 1, profile_img: 1 }
  );
  const filter = {
    $and: [
      {
        fromUser: viewer_id,
        toUser: _id,
      },
      {
        requestPending: true,
      },
    ],
  };
  const requestExists = await request.findOne(filter);
  const allRatings = await RatingsReviews.find({ leader_id: _id }, { _id: 0, leader_id: 1, trustWorthy: 1,knowledgeable:1,helpul:1,
    available:1,courageous:1,efficient:1 });
  const trustWorthy = allRatings.reduce((acc, curr) => acc + (curr.trustWorthy || 0), 0);
    const trustWorthyRate = allRatings.length > 0 ? trustWorthy / allRatings.length : null;
    
    const knowledgeable = allRatings.reduce((acc, curr) => acc + (curr.knowledgeable || 0), 0);
    const knowledgeableRate = allRatings.length > 0 ? knowledgeable / allRatings.length : null;
    
    const helpful = allRatings.reduce((acc, curr) => acc + (curr.helpful || 0), 0);
    const helpfulRate = allRatings.length > 0 ? helpful / allRatings.length : null;
    
    const available = allRatings.reduce((acc, curr) => acc + (curr.available || 0), 0);
    const availableRate = allRatings.length > 0 ? available / allRatings.length : null;
    
    const courageous = allRatings.reduce((acc, curr) => acc + (curr.courageous || 0), 0);
    const courageousRate = allRatings.length > 0 ? courageous / allRatings.length : null;
    
    const efficient = allRatings.reduce((acc, curr) => acc + (curr.efficient || 0), 0);
    const efficientRate = allRatings.length > 0 ? efficient / allRatings.length : null;
    
    let totalSum = 0;
    let totalCount = 0;
    
    allRatings.forEach(rating => {
        totalSum += trustWorthyRate + knowledgeableRate + helpfulRate + availableRate + courageousRate + efficientRate;
        totalCount += 6; 
    });
    
    // Calculate overall average rating
    const overallAverageRating = totalSum / totalCount;
    
    console.log("Overall average rating:", overallAverageRating);
  if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
    if (result) {
      return res.status(200).json({
        Status: true,
        message: "profile fetched successfully",
        
        result,
        connections,
        posts,
        postimages,
        isConnected: true,
        requestExists: requestExists ? true : false,
        overallAverageRating,
        groupCount,
        overallAmount
      });
    } else {
      return res
        .status(400)
        .json({ Status: false, message: "error " });
    }
  } else {
    if (result) {
      return res.status(200).json({
        Status: true,
        message: "profile fetched successfully",
        result,
        connections,
        posts,
        postimages,
        isConnected: false,
        requestExists: requestExists ? true : false,
        overallAverageRating,
        groupCount,
        overallAmount
      });
    } else {
      return res
        .status(400)
        .json({ Status: false, message: "error " });
    }
  }
}
}else if(result1){
  const result=await  citiZenUsermaster.findOne({_id:_id})
  const isprivate=result.private
  const isConnected=result.connected
  const isPublic=result.public
  const blockedIds=result.blockContact
  const connectedppl=await connection.findOne({user_id:_id})
    const connectedids=connectedppl?.connections?.map(connection => connection._id) || []
const connectIdsStr= connectedids.map(id => id.toString());
console.log(connectIdsStr)
const connectIdsStrs=await citiZenUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
const connectIdsStrss= connectIdsStrs.map(doc => doc._id.toString());
const connectIdsStrsl=await leaderUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
const connectIdsStrssl= connectIdsStrs.map(doc => doc._id.toString());
if(blockedIds.includes(viewer_id)){
return res.status(400).json({status:false,message:'cant view profile'})
}else  if(isprivate===true){
return res.status(400).json({status:false,message:'This is an Private Account'})
}else if(!isprivate===true&&connectIdsStr.includes(viewer_id)){
  const ordramount = await Order.aggregate([
    {
      $match: { customer_Id: result1.customer_Id } 
    },
    {
      $group: {
        _id: null, 
        totalAmount: { $sum: "$amount" } 
      }
    },
    {
      $project: { _id: 0, totalAmount: 1 } 
    }
  ]);
  const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
  console.log(overallAmount)
const postimages = await post.find(
{ user_id: { $eq: _id } },
{ _id: 0, Post: 1 }
);
const posts = postimages.length;
const count = await connection.findOne(
{ user_id: _id },
{ _id: 0, connections: 1 }
);

const connect = count ? count.connections : [];
const connections = connectIdsStrss.length;
const filter = {
$and: [
{
fromUser: viewer_id,
toUser: _id,
},
{
requestPending: true,
},
],
};
const requestExists = await request.findOne(filter);
const data = await citiZenUsermaster.findOne(
  { _id: viewer_id },
  { _id: 1, token: 1, firstname: 1, profile_img: 1 }
  );
  const data1 = await leaderUsermaster.findOne(
  { _id: viewer_id },
  { _id: 1, token: 1, firstname: 1, profile_img: 1 }
  );
if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
if (result) {
return res.status(200).json({
Status: true,
message: "profile fetched successfully",
result,
connections,
posts,
postimages,
isConnected: true,
requestExists: requestExists ? true : false,
overallAmount
});
} else {
return res
.status(400)
.json({ Status: false, message: "error " });
}
} else {
if (result) {
return res.status(200).json({
Status: true,
message: "profile fetched successfully",
result,
connections,
posts,
postimages,
isConnected: false,
requestExists: requestExists ? true : false,
overallAmount
});
} else {
return res
.status(400)
.json({ Status: false, message: "error " });
}
}
}else if(isPublic===true){
  const ordramount = await Order.aggregate([
    {
      $match: { customer_Id: result1.customer_Id } 
    },
    {
      $group: {
        _id: null, 
        totalAmount: { $sum: "$amount" } 
      }
    },
    {
      $project: { _id: 0, totalAmount: 1 } 
    }
  ]);
  const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
  console.log(overallAmount)
const postimages = await post.find(
{ user_id: { $eq: _id } },
{ _id: 0, Post: 1 }
);
const posts = postimages.length;
const count = await connection.findOne(
{ user_id: _id },
{ _id: 0, connections: 1 }
);
const connections = connectIdsStrss.length

const connect = count ? count.connections : [];

const data = await citiZenUsermaster.findOne(
{ _id: viewer_id },
{ _id: 1, token: 1, firstname: 1, profile_img: 1 }
);
const data1= await leaderUsermaster.findOne(
{ _id: viewer_id },
{ _id: 1, token: 1, firstname: 1, profile_img: 1 }
);
const filter = {
$and: [
{
fromUser: viewer_id,
toUser: _id,
},
{
requestPending: true,
},
],
};
const requestExists = await request.findOne(filter);
if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
if (result) {
return res.status(200).json({
Status: true,
message: "profile fetched successfully",

result,
connections,
posts,
postimages,
isConnected: true,
requestExists: requestExists ? true : false,
overallAmount
});
} else {
return res
.status(400)
.json({ Status: false, message: "error " });
}
} else {
if (result) {
return res.status(200).json({
Status: true,
message: "profile fetched successfully",
result,
connections,
posts,
postimages,
isConnected: false,
requestExists: requestExists ? true : false,
overallAmount
});
} else {
return res
.status(400)
.json({ Status: false, message: "error " });
}
}
}
}
   }else{
     return res.status(400).json({ Status: "somethig is wrong by passing parametr please verify" });
    }
  } catch (err) {
   console.log(err)
    return res.status(400).json({ Status: "Error", Error });
  }
}

// exports.getOtherprofile = async (req, res) => {
//   try {
//     const { _id, viewer_id } = req.body;

//     if (_id&&viewer_id) {
//       const result = await leaderUsermaster.findOne({_id:_id});
//       const id= new mongoose.Types.ObjectId(_id)
//       const sosCount=  await sosSchema.countDocuments({"accptedleader._id": id, closed: true});
//     console.log(sosCount)
//       const result1=await  citiZenUsermaster.findOne({_id:_id})
      
//       const groupCount = await CreateGroup.countDocuments({ "admin_id._id": id });
//       if(result){
//         const ordramount = await Order.aggregate([
//           {
//             $match: { customer_Id: result.customer_Id } 
//           },
//           {
//             $group: {
//               _id: null, 
//               totalAmount: { $sum: "$amount" } 
//             }
//           },
//           {
//             $project: { _id: 0, totalAmount: 1 } 
//           }
//         ]);
//         const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
//         console.log(overallAmount)
//         const isprivate=result.private
//           const isConnected=result.connected
//           const isPublic=result.public
//           const blockedIds=result.blockContact
//           const connectedppl=await connection.findOne({user_id:_id})
//             const connectedids=connectedppl?.connections?.map(connection => connection._id) || []
//    const connectIdsStr= connectedids.map(id => id.toString());
//    console.log(connectIdsStr)
//    const connectIdsStrs=await citiZenUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
//    const connectIdsStrss= connectIdsStrs.map(doc => doc._id.toString());
//    const connectIdsStrsl=await leaderUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
//    const connectIdsStrssl= connectIdsStrs.map(doc => doc._id.toString());
//    if(blockedIds.includes(viewer_id)){
//     return res.status(400).json({status:false,message:'cant view profile'})
//    }else  if(isprivate===true){
//     return res.status(400).json({status:false,message:'This is an Private Account'})
//  }else if(!isprivate===true&&connectIdsStr.includes(viewer_id)){
//   const postimages = await post.find(
//     { user_id: { $eq: _id } },
//     { _id: 0, Post_img: 1 }
//   );
//   const posts = postimages.length;
//   const count = await connection.findOne(
//     { user_id: _id },
//     { _id: 0, connections: 1 }
//   );

//   const connect = count ? count.connections : [];
//   const data = await citiZenUsermaster.findOne(
//     { _id: viewer_id },
//     { _id: 1, token: 1, firstname: 1, profile_img: 1 }
//   );
//   const data1 = await leaderUsermaster.findOne(
//     { _id: viewer_id },
//     { _id: 1, token: 1, firstname: 1, profile_img: 1 }
//   );
//   const connections = connectIdsStrss.length;
//   const filter = {
//     $and: [
//       {
//         fromUser: viewer_id,
//         toUser: _id,
//       },
//       {
//         requestPending: true,
//       },
//     ],
//   };
//   const requestExists = await request.findOne(filter);
//   const allRatings = await RatingsReviews.find({ leader_id: _id }, { _id: 0, leader_id: 1, trustWorthy: 1,knowledgeable:1,helpul:1,
//     available:1,courageous:1,efficient:1 });
//   const trustWorthy = allRatings.reduce((acc, curr) => acc + (curr.trustWorthy || 0), 0);
//     const trustWorthyRate = allRatings.length > 0 ? trustWorthy / allRatings.length : null;
    
//     const knowledgeable = allRatings.reduce((acc, curr) => acc + (curr.knowledgeable || 0), 0);
//     const knowledgeableRate = allRatings.length > 0 ? knowledgeable / allRatings.length : null;
    
//     const helpful = allRatings.reduce((acc, curr) => acc + (curr.helpful || 0), 0);
//     const helpfulRate = allRatings.length > 0 ? helpful / allRatings.length : null;
    
//     const available = allRatings.reduce((acc, curr) => acc + (curr.available || 0), 0);
//     const availableRate = allRatings.length > 0 ? available / allRatings.length : null;
    
//     const courageous = allRatings.reduce((acc, curr) => acc + (curr.courageous || 0), 0);
//     const courageousRate = allRatings.length > 0 ? courageous / allRatings.length : null;
    
//     const efficient = allRatings.reduce((acc, curr) => acc + (curr.efficient || 0), 0);
//     const efficientRate = allRatings.length > 0 ? efficient / allRatings.length : null;
    
//     let totalSum = 0;
//     let totalCount = 0;
    
//     allRatings.forEach(rating => {
//         totalSum += trustWorthyRate + knowledgeableRate + helpfulRate + availableRate + courageousRate + efficientRate;
//         totalCount += 6; 
//     });
    
//     // Calculate overall average rating
//     const overallAverageRating = totalSum / totalCount;
   
//     console.log("Overall average rating:", overallAverageRating);
//   if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
//     if (result) {
//       return res.status(200).json({
//         Status: true,
//         message: "profile fetched successfully",
//         result,
//         connections,
//         posts,
//         sosCount,
//         postimages,
//         isConnected: true,
//         requestExists: requestExists ? true : false,
//         overallAverageRating,
//         groupCount,
//         overallAmount
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ Status: false, message: "error " });
//     }
//   } else {
//     if (result) {
//       return res.status(200).json({
//         Status: true,
//         message: "profile fetched successfully",
//         result,
//         connections,
//         posts,
//         sosCount,
//         postimages,
//         isConnected: false,
//         requestExists: requestExists ? true : false,
//         overallAverageRating,
//         groupCount,
//         overallAmount
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ Status: false, message: "error " });
//     }
//   }
//  }else if(isPublic===true){
//   const postimages = await post.find(
//     { user_id: { $eq: _id } },
//     { _id: 0, Post_img: 1 }
//   );
//   const posts = postimages.length;
//   const count = await connection.findOne(
//     { user_id: _id },
//     { _id: 0, connections: 1 }
//   );
//   const connections = connectIdsStrss.length
  
//   const connect = count ? count.connections : [];

//   const data = await citiZenUsermaster.findOne(
//     { _id: viewer_id },
//     { _id: 1, token: 1, firstname: 1, profile_img: 1 }
//   );
//   const data1= await leaderUsermaster.findOne(
//     { _id: viewer_id },
//     { _id: 1, token: 1, firstname: 1, profile_img: 1 }
//   );
//   const filter = {
//     $and: [
//       {
//         fromUser: viewer_id,
//         toUser: _id,
//       },
//       {
//         requestPending: true,
//       },
//     ],
//   };
//   const requestExists = await request.findOne(filter);
//   const allRatings = await RatingsReviews.find({ leader_id: _id }, { _id: 0, leader_id: 1, trustWorthy: 1,knowledgeable:1,helpul:1,
//     available:1,courageous:1,efficient:1 });
//   const trustWorthy = allRatings.reduce((acc, curr) => acc + (curr.trustWorthy || 0), 0);
//     const trustWorthyRate = allRatings.length > 0 ? trustWorthy / allRatings.length : null;
    
//     const knowledgeable = allRatings.reduce((acc, curr) => acc + (curr.knowledgeable || 0), 0);
//     const knowledgeableRate = allRatings.length > 0 ? knowledgeable / allRatings.length : null;
    
//     const helpful = allRatings.reduce((acc, curr) => acc + (curr.helpful || 0), 0);
//     const helpfulRate = allRatings.length > 0 ? helpful / allRatings.length : null;
    
//     const available = allRatings.reduce((acc, curr) => acc + (curr.available || 0), 0);
//     const availableRate = allRatings.length > 0 ? available / allRatings.length : null;
    
//     const courageous = allRatings.reduce((acc, curr) => acc + (curr.courageous || 0), 0);
//     const courageousRate = allRatings.length > 0 ? courageous / allRatings.length : null;
    
//     const efficient = allRatings.reduce((acc, curr) => acc + (curr.efficient || 0), 0);
//     const efficientRate = allRatings.length > 0 ? efficient / allRatings.length : null;
    
//     let totalSum = 0;
//     let totalCount = 0;
    
//     allRatings.forEach(rating => {
//         totalSum += trustWorthyRate + knowledgeableRate + helpfulRate + availableRate + courageousRate + efficientRate;
//         totalCount += 6; 
//     });
    
//     // Calculate overall average rating
//     const overallAverageRating = totalSum / totalCount;
    
//     console.log("Overall average rating:", overallAverageRating);
//   if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
//     if (result) {
//       return res.status(200).json({
//         Status: true,
//         message: "profile fetched successfully",
        
//         result,
//         connections,
//         posts,
//         sosCount,
//         postimages,
//         isConnected: true,
//         requestExists: requestExists ? true : false,
//         overallAverageRating,
//         groupCount,
//         overallAmount
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ Status: false, message: "error " });
//     }
//   } else {
//     if (result) {
//       return res.status(200).json({
//         Status: true,
//         message: "profile fetched successfully",
//         result,
//         connections,
//         posts,
//         postimages,
//         isConnected: false,
//         requestExists: requestExists ? true : false,
//         overallAverageRating,
//         groupCount,
//         overallAmount
//       });
//     } else {
//       return res
//         .status(400)
//         .json({ Status: false, message: "error " });
//     }
//   }
// }
// }else if(result1){
//   const ordramount = await Order.aggregate([
//     {
//       $match: { customer_Id: result1.customer_Id } 
//     },
//     {
//       $group: {
//         _id: null, 
//         totalAmount: { $sum: "$amount" } 
//       }
//     },
//     {
//       $project: { _id: 0, totalAmount: 1 } 
//     }
//   ]);
//   const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
//   console.log(overallAmount)
//   const result1=await  citiZenUsermaster.findOne({_id:_id})
//   const isprivate=result.private
//   const isConnected=result.connected
//   const isPublic=result.public
//   const blockedIds=result.blockContact
//   const connectedppl=await connection.findOne({user_id:_id})
//     const connectedids=connectedppl?.connections?.map(connection => connection._id) || []
// const connectIdsStr= connectedids.map(id => id.toString());
// console.log(connectIdsStr)
// const connectIdsStrs=await citiZenUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
// const connectIdsStrss= connectIdsStrs.map(doc => doc._id.toString());
// const connectIdsStrsl=await leaderUsermaster.find({_id:{$in:connectIdsStr}},{_id:1})
// const connectIdsStrssl= connectIdsStrs.map(doc => doc._id.toString());
// if(blockedIds.includes(viewer_id)){
// return res.status(400).json({status:false,message:'cant view profile'})
// }else  if(isprivate===true){
// return res.status(400).json({status:false,message:'This is an Private Account'})
// }else if(!isprivate===true&&connectIdsStr.includes(viewer_id)){
  
// const postimages = await post.find(
// { user_id: { $eq: _id } },
// { _id: 0, Post: 1 }
// );
// const posts = postimages.length;
// const count = await connection.findOne(
// { user_id: _id },
// { _id: 0, connections: 1 }
// );

// const connect = count ? count.connections : [];
// const connections = connectIdsStrss.length;
// const filter = {
// $and: [
// {
// fromUser: viewer_id,
// toUser: _id,
// },
// {
// requestPending: true,
// },
// ],
// };
// const requestExists = await request.findOne(filter);
// const data = await citiZenUsermaster.findOne(
//   { _id: viewer_id },
//   { _id: 1, token: 1, firstname: 1, profile_img: 1 }
//   );
//   const data1 = await leaderUsermaster.findOne(
//   { _id: viewer_id },
//   { _id: 1, token: 1, firstname: 1, profile_img: 1 }
//   );
// if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
// if (result) {
// return res.status(200).json({
// Status: true,
// message: "profile fetched successfully",
// result,
// connections,
// posts,
// sosCount,
// overallAmount,
// postimages,
// isConnected: true,
// requestExists: requestExists ? true : false,
// });
// } else {
// return res
// .status(400)
// .json({ Status: false, message: "error " });
// }
// } else {
// if (result) {
// return res.status(200).json({
// Status: true,
// message: "profile fetched successfully",
// result,
// connections,
// posts,
// sosCount,
// overallAmount,
// postimages,
// isConnected: false,
// requestExists: requestExists ? true : false,
// });
// } else {
// return res
// .status(400)
// .json({ Status: false, message: "error " });
// }
// }
// }else if(isPublic===true){
// const postimages = await post.find(
// { user_id: { $eq: _id } },
// { _id: 0, Post: 1 }
// );
// const posts = postimages.length;
// const count = await connection.findOne(
// { user_id: _id },
// { _id: 0, connections: 1 }
// );
// const connections = connectIdsStrss.length

// const connect = count ? count.connections : [];

// const data = await citiZenUsermaster.findOne(
// { _id: viewer_id },
// { _id: 1, token: 1, firstname: 1, profile_img: 1 }
// );
// const data1= await leaderUsermaster.findOne(
// { _id: viewer_id },
// { _id: 1, token: 1, firstname: 1, profile_img: 1 }
// );
// const filter = {
// $and: [
// {
// fromUser: viewer_id,
// toUser: _id,
// },
// {
// requestPending: true,
// },
// ],
// };
// const requestExists = await request.findOne(filter);
// if (connect.some(c => [data, data1].some(d => d?._id?.toString() === c._id?.toString()))) {
// if (result) {
// return res.status(200).json({
// Status: true,
// message: "profile fetched successfully",

// result,
// connections,
// posts,
// sosCount,
// postimages,
// overallAmount,
// isConnected: true,
// requestExists: requestExists ? true : false,
// });
// } else {
// return res
// .status(400)
// .json({ Status: false, message: "error " });
// }
// } else {
// if (result) {
// return res.status(200).json({
// Status: true,
// message: "profile fetched successfully",
// result,
// connections,
// posts,
// postimages,
// overallAmount,
// isConnected: false,
// requestExists: requestExists ? true : false,
// });
// } else {
// return res
// .status(400)
// .json({ Status: false, message: "error " });
// }
// }
// }
// }
//    }else{
//      return res.status(400).json({ Status: "somethig is wrong by passing parametr please verify" });
//     }
//   } catch (err) {
//    console.log(err)
//     return res.status(400).json({ Status: "Error", Error });
//   }
// }

// exports.getMyprofile=async(req,res)=>{
//   try {
//     const { _id } = req.params;
//     const result = await leaderUsermaster.findOne({ _id: _id });
//     const result1=await citiZenUsermaster.findOne({_id:_id})
//     if(result){
//       const ordramount = await Order.aggregate([
//         {
//           $match: { customer_Id: result.customer_Id } 
//         },
//         {
//           $group: {
//             _id: null, 
//             totalAmount: { $sum: "$amount" } 
//           }
//         },
//         {
//           $project: { _id: 0, totalAmount: 1 } 
//         }
//       ]);
//       const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
//       console.log(overallAmount)
//       const results = await post.find({ user_id: { $eq: _id } }, { _id: 0, Post: 1 })
//     const connectionss = await connection.findOne({user_id:_id})
//     const Connection =  connectionss?.connections?.length || 0
//     const posts = results.length;
//     const id= new mongoose.Types.ObjectId(_id)
//     const sosCount=  await sosSchema.countDocuments({"accptedleader._id": id, closed: true});
//     console.log(sosCount)
//     const allRatings = await RatingsReviews.find({ leader_id: _id }, { _id: 0, leader_id: 1, trustWorthy: 1,knowledgeable:1,helpul:1,
//     available:1,courageous:1,efficient:1 });
//     const trustWorthy = allRatings.reduce((acc, curr) => acc + (curr.trustWorthy || 0), 0);
//     const trustWorthyRate = allRatings.length > 0 ? trustWorthy / allRatings.length : null;
    
//     const knowledgeable = allRatings.reduce((acc, curr) => acc + (curr.knowledgeable || 0), 0);
//     const knowledgeableRate = allRatings.length > 0 ? knowledgeable / allRatings.length : null;
    
//     const helpful = allRatings.reduce((acc, curr) => acc + (curr.helpful || 0), 0);
//     const helpfulRate = allRatings.length > 0 ? helpful / allRatings.length : null;
    
//     const available = allRatings.reduce((acc, curr) => acc + (curr.available || 0), 0);
//     const availableRate = allRatings.length > 0 ? available / allRatings.length : null;
    
//     const courageous = allRatings.reduce((acc, curr) => acc + (curr.courageous || 0), 0);
//     const courageousRate = allRatings.length > 0 ? courageous / allRatings.length : null;
    
//     const efficient = allRatings.reduce((acc, curr) => acc + (curr.efficient || 0), 0);
//     const efficientRate = allRatings.length > 0 ? efficient / allRatings.length : null;
    
//     let totalSum = 0;
//     let totalCount = 0;
    
//     allRatings.forEach(rating => {
//         totalSum += trustWorthyRate + knowledgeableRate + helpfulRate + availableRate + courageousRate + efficientRate;
//         totalCount += 6; 
//     });
    
//     // Calculate overall average rating
//     const overallAverageRating = totalSum / totalCount;
    
//     console.log("Overall average rating:", overallAverageRating);
//     const groupCount = await CreateGroup.countDocuments({ "admin_id._id": id });
//     return res.status(200).json({
//       Status: true,
//       message: 'Profile fetched successfully',
//       result,
//       Connection,
//       posts,
//       rating:overallAverageRating,
//       sosCount,
//       groupCount,
//       overallAmount
//     });
//   }else if(result1){
//     const result = await citiZenUsermaster.findOne({ _id: _id });
//     const results = await post.find({ user_id: { $eq: _id } }, { _id: 0, Post: 1 });
//     const connectionss = await connection.findOne({user_id:_id})
//     console.log(connectionss)
//     const Connection =  connectionss?.connections?.length || 0
//     const posts = results.length;

//     return res.status(200).json({
//       Status: true,
//       message: 'Profile fetched successfully',
//       result,
//       Connection,
//       posts,
//     });
//   }else{
//     return res.status(400).json({ Status:false, message:'unable to fetch data' });
//   }
    
//   } catch (err) {
//     console.log(err)
//     return res.status(400).json({ Status: 'Error', Error: err.message });
//   }
// }




exports.getMyprofile = async (req, res) => {
  try {
    const { _id } = req.params;
    const result = await leaderUsermaster.findOne({ _id: _id });
    const result1 = await citiZenUsermaster.findOne({ _id: _id });
    if (result) {
      const ordramount = await Order.aggregate([
        { $match: { customer_Id: result.customer_Id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        { $project: { _id: 0, totalAmount: 1 } }
      ]);
      const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
      console.log(overallAmount);
      const results = await post.find({ user_id: { $eq: _id } }, { _id: 0, Post: 1 });
      const connectionss = await connection.findOne({ user_id: _id });
      const Connection = connectionss?.connections?.length || 0;
      const posts = results.length;
      const id = new mongoose.Types.ObjectId(_id);
      const sosCount = await sosSchema.countDocuments({ "accptedleader._id": id, closed: true });
      console.log(sosCount);
      const allRatings = await RatingsReviews.find({ leader_id: _id }, { _id: 0, leader_id: 1, trustWorthy: 1, knowledgeable: 1, helpful: 1, available: 1, courageous: 1, efficient: 1 });
      const trustWorthy = allRatings.reduce((acc, curr) => acc + (curr.trustWorthy || 0), 0);
      const trustWorthyRate = allRatings.length > 0 ? trustWorthy / allRatings.length : null;
      const knowledgeable = allRatings.reduce((acc, curr) => acc + (curr.knowledgeable || 0), 0);
      const knowledgeableRate = allRatings.length > 0 ? knowledgeable / allRatings.length : null;
      const helpful = allRatings.reduce((acc, curr) => acc + (curr.helpful || 0), 0);
      const helpfulRate = allRatings.length > 0 ? helpful / allRatings.length : null;
      const available = allRatings.reduce((acc, curr) => acc + (curr.available || 0), 0);
      const availableRate = allRatings.length > 0 ? available / allRatings.length : null;
      const courageous = allRatings.reduce((acc, curr) => acc + (curr.courageous || 0), 0);
      const courageousRate = allRatings.length > 0 ? courageous / allRatings.length : null;
      const efficient = allRatings.reduce((acc, curr) => acc + (curr.efficient || 0), 0);
      const efficientRate = allRatings.length > 0 ? efficient / allRatings.length : null;
      let totalSum = 0;
      let totalCount = 0;
      allRatings.forEach(rating => {
          totalSum += trustWorthyRate + knowledgeableRate + helpfulRate + availableRate + courageousRate + efficientRate;
          totalCount += 6; 
      });
      const overallAverageRating = totalSum / totalCount;
      console.log("Overall average rating:", overallAverageRating);
      const groupCount = await CreateGroup.countDocuments({ "admin_id._id": id });
      return res.status(200).json({
        Status: true,
        message: 'Profile fetched successfully',
        result,
        Connection,
        posts,
        rating: overallAverageRating,
        sosCount,
        groupCount,
        overallAmount
      });
    } else if (result1) {
      const ordramount = await Order.aggregate([
        { $match: { customer_Id: result1.customer_Id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
        { $project: { _id: 0, totalAmount: 1 } }
      ]);
      const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
      console.log(overallAmount);
      const results = await post.find({ user_id: { $eq: _id } }, { _id: 0, Post: 1 });
      const connectionss = await connection.findOne({ user_id: _id });
      console.log(connectionss);
      const Connection = connectionss?.connections?.length || 0;
      const posts = results.length;
      return res.status(200).json({
        Status: true,
        message: 'Profile fetched successfully',
        result: result1,
        Connection,
        posts,
        overallAmount
      });
    } else {
      return res.status(400).json({ Status: false, message: 'unable to fetch data' });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ Status: 'Error', Error: err.message });
  }
};




// exports.getMyprofile = async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const result = await leaderUsermaster.findOne({ _id: _id });
//     const result1Citizen = await citiZenUsermaster.findOne({ _id: _id });
//     if (result) {
//       const ordramount = await Order.aggregate([
//         { $match: { customer_Id: result.customer_Id } },
//         {
//           $group: {
//             _id: null,
//             totalAmount: { $sum: "$amount" }
//           }
//         },
//         { $project: { _id: 0, totalAmount: 1 } }
//       ]);
//       const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
//       console.log(overallAmount);
//       const results = await post.find({ user_id: { $eq: _id } }, { _id: 0, Post: 1 });
//       const connectionss = await connection.findOne({ user_id: _id });
//       const Connection = connectionss?.connections?.length || 0;
//       const posts = results.length;
//       const id = new mongoose.Types.ObjectId(_id);
//       const sosCount = await sosSchema.countDocuments({ "accptedleader._id": id, closed: true });
//       console.log(sosCount);
//       const allRatings = await RatingsReviews.find({ leader_id: _id }, { _id: 0, leader_id: 1, trustWorthy: 1, knowledgeable: 1, helpul: 1, available: 1, courageous: 1, efficient: 1 });
//       const trustWorthy = allRatings.reduce((acc, curr) => acc + (curr.trustWorthy || 0), 0);
//       const trustWorthyRate = allRatings.length > 0 ? trustWorthy / allRatings.length : null;


//       const knowledgeable = allRatings.reduce((acc, curr) => acc + (curr.knowledgeable || 0), 0);
//       const knowledgeableRate = allRatings.length > 0 ? knowledgeable / allRatings.length : null;
      
//       const helpful = allRatings.reduce((acc, curr) => acc + (curr.helpful || 0), 0);
//       const helpfulRate = allRatings.length > 0 ? helpful / allRatings.length : null;
      
//       const available = allRatings.reduce((acc, curr) => acc + (curr.available || 0), 0);
//       const availableRate = allRatings.length > 0 ? available / allRatings.length : null;
      
//       const courageous = allRatings.reduce((acc, curr) => acc + (curr.courageous || 0), 0);
//       const courageousRate = allRatings.length > 0 ? courageous / allRatings.length : null;
      
//       const efficient = allRatings.reduce((acc, curr) => acc + (curr.efficient || 0), 0);
//       const efficientRate = allRatings.length > 0 ? efficient / allRatings.length : null;
      
//       let totalSum = 0;
//       let totalCount = 0;
      
//       allRatings.forEach(rating => {
//           totalSum += trustWorthyRate + knowledgeableRate + helpfulRate + availableRate + courageousRate + efficientRate;
//           totalCount += 6; 
//       });
//       // Calculate overall average rating
//       const overallAverageRating = totalSum / totalCount;

//       console.log("Overall average rating:", overallAverageRating);
//       const groupCount = await CreateGroup.countDocuments({ "admin_id._id": id });
//       return res.status(200).json({
//         Status: true,
//         message: 'Profile fetched successfully',
//         result,
//         Connection,
//         posts,
//         rating: overallAverageRating,
//         sosCount,
//         groupCount,
//         overallAmount
//       });
//     } else if (result1Citizen) {
//       const ordramount = await Order.aggregate([
//         { $match: { customer_Id: result1Citizen.customer_Id } },
//         {
//           $group: {
//             _id: null,
//             totalAmount: { $sum: "$amount" }
//           }
//         },
//         { $project: { _id: 0, totalAmount: 1 } }
//       ]);
//       const overallAmount = ordramount.length > 0 ? ordramount[0].totalAmount : 0;
//       console.log(overallAmount);
//       const results = await post.find({ user_id: { $eq: _id } }, { _id: 0, Post: 1 });
//       const connectionss = await connection.findOne({ user_id: _id });
//       console.log(connectionss);
//       const Connection = connectionss?.connections?.length || 0;
//       const posts = results.length;

//       return res.status(200).json({
//         Status: true,
//         message: 'Profile fetched successfully',
//         result:result1Citizen,
//         Connection,
//         posts,
//         overallAmount
//       });
//     } else {
//       return res.status(400).json({ Status: false, message: 'unable to fetch data' });
//     }

//   } catch (err) {
//     console.log(err);
//     return res.status(400).json({ Status: 'Error', Error: err.message });
//   }
// }




// exports.updateProfileCitizenimg=async(req,res)=>{
//   try{
//       const _id=req.body._id
//       if(!_id){
//           res.status(401).json({status:false,message:"please provide all the details"})
//         }else{
//           const check=await citiZenUsermaster.findOneAndUpdate({_id:_id},{$set:{profile_img:req.file.filename}})
//           if(check){
//               const response=await citiZenUsermaster.findOne({_id:_id})
//               return res.status(200).json({status:true,message:"profile created successfully",response})
//           }else{
//               return res.status(401).json({status:false,message:"couldnot create a profile try later"})
//           }
//     }
//   }catch(err){
//       console.log(err)
//             return res.status(400).send({Status:'Error',message:'somthing went wrong'})
//            } 
// }



// exports.updateProfileLeaderimg = async (req, res) => {
//   try {
//     const { _id } = req.body;

//     if (!_id) {
//       return res.status(401).json({ status: false, message: "Please provide all the details" });
//     }

//     const user = await leaderUsermaster.findOne({ _id: _id });

//     if (!user) {
//       return res.status(404).json({ status: false, message: "User not found" });
//     }

//     // Update profile_img
//     const updatedUser = await leaderUsermaster.findOneAndUpdate(
//       { _id: _id },
//       { $set: { profile_img: req.file.filename } },
//       { new: true } // Return the updated document
//     );

//     if (updatedUser) {
//       return res.status(200).json({ status: true, message: "Profile image updated successfully", user: updatedUser });
//     } else {
//       return res.status(500).json({ status: false, message: "Could not update profile, please try again later" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ status: false, message: "Something went wrong" });
//   }
// };  




exports.getLanguages=async(req,res)=>{
  try{
const result=await Languages.find()
console.log(result)
return res.status(200).send({ status: true, message:"Languages Data Fetched Succesfully",result});
} catch (err) {
    console.error(err);
    return res.status(500).send({ status: false, message: "Internal Server Error" });
  }
}
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency, receipt, customer_Id } = req.body;
    
    const orderData = {
      amount: amount, 
      currency: currency || 'INR',
      receipt: receipt || 'order_receipt',
      customer_id: customer_Id,
    };

    const order = await razorpayGlobalInstance.orders.create(orderData);
const data=await leaderUsermaster.findOne({customer_Id:customer_Id},{_id:1,profile_img:1,firstname:1})
const newdata= data|| await citiZenUsermaster.findOne({customer_Id:customer_Id},{_id:1,profile_img:1,firstname:1})
    const newOrder = new Order({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      userDetails:newdata,
      customer_Id:customer_Id
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      status: 'success',
      message: 'Razorpay order created successfully',
      savedOrder: savedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
exports.gettokens = async (req, res) => {
  try {
    const { customer_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isValidSignature = true;

    if (isValidSignature) {
      // Update Customer
      await Customer.findByIdAndUpdate(
        customer_id,
        { $set: { tokens: 'your-updated-tokens' } },
        { new: true }
      );

      // Update Refund
      await Refund.findOneAndUpdate(
        { paymentId: razorpay_payment_id },
        { $set: { refundId: 'your-updated-refundId' } },
        { new: true }
      );

      // Update Order
      await Order.findOneAndUpdate(
        { payment_id: razorpay_payment_id, signature: razorpay_signature },
        { $set: { isPaid: true } },
        { new: true }
      );

      res.json({ success: true, message: 'Tokens retrieved and records updated successfully' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error in gettokens:', error);
    res.status(500).json({ error: 'An error occurred while getting tokens.' });
  }
};
exports.verifyorder = async (req, res) => {
  try {
    const { order_id, payment_id } = req.body;


    const razorpayOrder = await razorpayGlobalInstance.orders.fetch(order_id);
    const payment = await razorpayGlobalInstance.payments.fetch(payment_id);

    if (
      razorpayOrder.status === 'paid' &&
      payment.status === 'captured' &&
      payment.order_id === razorpayOrder.id
    ) {
      
      res.json({ success: true, message: 'Order verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid order or payment' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while verifying the order.' });
  }
};
exports.refund = async (req, res) => {
  try {
    const options = {
      payment_id: req.body.paymentId,
      amount: req.body.amount,
    };

    razorpay.payments.refund(options, async (err, razorpayResponse) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', message: 'Razorpay refund failed' });
      }

      const refundDetails = new Refund({
        paymentId: req.body.paymentId,
        amount: req.body.amount,
        refundId: razorpayResponse.id,
      });

      const response = await refundDetails.save();

      return res.status(201).json({ status: 'success', message: 'Refund successful', response });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
exports.getAllPayments = async (req, res) => {
  try {
    const orders = await Order.find({});
    const refunds = await Refund.find({});

    return res.status(200).json({
      status: 'success',
      message: 'All payments retrieved successfully',
      orders: orders,
      // refunds: refunds
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
exports.getPayments = async (req, res) => {
  try {
    const { customer_Id } = req.body;

    console.log('Received customer_Id:', customer_Id);

    if (!customer_Id) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide customer_Id in the request body',
      });
    }

    const orders = await Order.find({ customer_Id: customer_Id }).exec();

    console.log('Matching orders:', orders);

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No orders found for the provided customer_Id',
      });
    }

    const paymentDetails = orders.map(order => ({
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      userDetails: {
        _id: order.userDetails._id,
        firstname: order.userDetails.firstname,
        profile_img: order.userDetails.profile_img,
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      razorpay_timestamp: order.razorpay_timestamp,
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Customer payment details retrieved successfully',
      customer_Id: customer_Id,
      payments: paymentDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
exports.updateProfileLeaderimg = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(401).json({ status: false, message: "Please provide all the details" });
    }

    const filename = req.file.filename;

    // Update user profile
    const updatedUser = await leaderUsermaster.findOneAndUpdate(
      { _id: _id },
      { $set: { profile_img: filename } },
      { new: true }
    );
    const user_id =new mongoose.Types.ObjectId(_id);
    await connection.updateMany(
      { 'connections._id': user_id },
      { $set: { "connections.$.profile_img": filename} }
    );
    await post.updateMany({
      "likedpeopledata._id": user_id
    },{$set:{'likedpeopledata.$.profile_img':filename}});
   
   await likespost.updateMany({
      "likesofposts._id": user_id
    },{$set:{'likesofposts.$.profile_img':filename}});

    await comment.updateMany({
      "commentdetails._id": user_id
    },{$set:{'commentdetails.profile_img':filename}});

    await replycomment.updateMany({
      "commentdetails._id": user_id
    },{ $set: { "commentdetails.profile_img": filename } })

    await connection.updateMany({
      "totalrequest._id": user_id
    },{$set:{'totalrequest.$.profile_img':filename}})

    await notifications.updateMany({accpeted_id:user_id},
      { $set: { "accpeted.icon": filename } }, { new: true })
    await notifications.updateMany({requested_id:user_id},
      { $set: { "request.icon": filename } }, { new: true })
    await notifications.updateMany({post_liker_id:user_id},
      { $set: {"likespost.icon": filename } }, { new: true })
    await notifications.updateMany({post_commenter_id:user_id},
      { $set: {"comment.icon": filename } }, { new: true })
    await notifications.updateMany({replyCommenter_id:user_id},
      { $set: {"replyComment.icon": filename } }, { new: true })
    await notifications.updateMany({replyCommente_liker_id:user_id},
      { $set: { "replyCommentlike.icon": filename } }, { new: true })
    await notifications.updateMany({commente_liker_id:user_id},
      { $set: {"likecomment.icon": filename } }, { new: true })
    await notifications.updateMany({mentioner_id:user_id},
      { $set: {"mentioned.icon": filename } }, { new: true })    
    if (updatedUser) {
      return res.status(200).json({ status: true, message: "Profile image updated successfully", user: updatedUser });
    } else {
      return res.status(500).json({ status: false, message: "Could not update profile, please try again later" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
};  
exports.updateProfileCitizenimg = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(401).json({ status: false, message: "Please provide all the details" });
    }
    const filename = req.file.filename;
    const updatedUser = await citiZenUsermaster.findOneAndUpdate(
      { _id: _id },
      { $set: { profile_img: filename } },
      { new: true }
    );
    const user_id =new mongoose.Types.ObjectId(_id);
    await connection.updateMany(
      { 'connections._id': user_id },
      { $set: { "connections.$.profile_img": filename} }
    );
    await post.updateMany({
      "likedpeopledata._id": user_id
    },{$set:{'likedpeopledata.$.profile_img':filename}});
   
   await likespost.updateMany({
      "likesofposts._id": user_id
    },{$set:{'likesofposts.$.profile_img':filename}});

    await comment.updateMany({
      "commentdetails._id": user_id
    },{$set:{'commentdetails.profile_img':filename}});

    await replycomment.updateMany({
      "commentdetails._id": user_id
    },{ $set: { "commentdetails.profile_img": filename } })

    await connection.updateMany({
      "totalrequest._id": user_id
    },{$set:{'totalrequest.$.profile_img':filename}})

    await notifications.updateMany({accpeted_id:user_id},
      { $set: { "accpeted.icon": filename } }, { new: true })
    await notifications.updateMany({requested_id:user_id},
      { $set: { "request.icon": filename } }, { new: true })
    await notifications.updateMany({post_liker_id:user_id},
      { $set: {"likespost.icon": filename } }, { new: true })
    await notifications.updateMany({post_commenter_id:user_id},
      { $set: {"comment.icon": filename } }, { new: true })
    await notifications.updateMany({replyCommenter_id:user_id},
      { $set: {"replyComment.icon": filename } }, { new: true })
    await notifications.updateMany({replyCommente_liker_id:user_id},
      { $set: { "replyCommentlike.icon": filename } }, { new: true })
    await notifications.updateMany({commente_liker_id:user_id},
      { $set: {"likecomment.icon": filename } }, { new: true })
    await notifications.updateMany({mentioner_id:user_id},
      { $set: {"mentioned.icon": filename } }, { new: true })    
      
    if (updatedUser) {
      return res.status(200).json({ status: true, message: "Profile image updated successfully", user: updatedUser });
    } else {
      return res.status(500).json({ status: false, message: "Could not update profile, please try again later" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Something went wrong" });
  }
};
exports.updateProfileLeader = async (req, res) => {
  try {
      const { _id, lastname, firstname, email, dob, education, proffession, familymembers, languages, movies, music, books, dance, sports, otherintrests, location } = req.body;
      if (!_id) {
          return res.status(401).json({ status: true, message: "please provide all the details" });
      } else {
          const check2 = await leaderUsermaster.findOneAndUpdate(
              { _id: _id },
              {
                  $set: {
                      familymembers: [],
                      languages: [],
                      "areaofintrest.movies": [],
                      "areaofintrest.music": [],
                      "areaofintrest.books": [],
                      "areaofintrest.dance": [],
                      "areaofintrest.sports": [],
                      "areaofintrest.otherintrests": []
                  }
              }
          );

          if (check2) {
              const check = await leaderUsermaster.findOneAndUpdate({ _id: _id }, { $set: { firstname: firstname, lastname: lastname, email: email, dob: dob, education: education, proffession: proffession, location: location } });
              const check1 = await leaderUsermaster.findOneAndUpdate(
                  { _id: _id },
                  {
                      $push: {
                          familymembers: { $each: familymembers },
                          languages: { $each: languages },
                          "areaofintrest.movies": { $each: movies },
                          "areaofintrest.music": { $each: music },
                          "areaofintrest.books": { $each: books },
                          "areaofintrest.dance": { $each: dance },
                          "areaofintrest.sports": { $each: sports },
                          "areaofintrest.otherintrests": { $each: otherintrests }
                      }
                  }
              );
              if (check && check1) {
                const user_id =new mongoose.Types.ObjectId(_id);
                await connection.updateMany(
                  { 'connections._id': user_id },
                  { $set: { 'connections.$.name':firstname} }
                );
                await post.updateMany({
                  "likedpeopledata._id": user_id
                },{$set:{'likedpeopledata.$.name':firstname}});
               
               await likespost.updateMany({
                  "likesofposts._id": user_id
                },{$set:{'likedpeopledata.$.name':firstname}});
            
                await comment.updateMany({
                  "commentdetails._id": user_id
                },{$set:{'commentdetails.name':firstname}});
            
                await replycomment.updateMany({
                  "commentdetails._id": user_id
                },{ $set: { 'commentlikerDetails.$.name':firstname} })
            
                await connection.updateMany({
                  "totalrequest._id": user_id
                },{$set:{'totalrequest.$.name':firstname}})
            
                await notifications.updateMany({accpeted_id:user_id},
                  { $set: { "accpeted.body":`${firstname} Connected With You`} }, { new: true })
                await notifications.updateMany({requested_id:user_id},
                  { $set: { "request.body":`${firstname} would like to connect with you` } }, { new: true })
                await notifications.updateMany({post_liker_id:user_id},
                  { $set: {"likespost.body": `${firstname} Liked your Post` } }, { new: true })
                await notifications.updateMany({post_commenter_id:user_id},
                  { $set: {"comment.body": `${firstname} Commented On your Post` } }, { new: true })
                await notifications.updateMany({replyCommenter_id:user_id},
                  { $set: {"replyComment.body":`${firstname} Commented On your Post`} }, { new: true })
                await notifications.updateMany({replyCommente_liker_id:user_id},
                  { $set: { "replyCommentlike.body": `${firstname} Liked your Comment` } }, { new: true })
                await notifications.updateMany({commente_liker_id:user_id},
                  { $set: {"likecomment.body": `${firstname} Liked your Comment` } }, { new: true })
                await notifications.updateMany({mentioner_id:user_id},
                  { $set: {"mentioned.body":  `${firstname} Mentioned You On Comment`  } }, { new: true })  
                  await leaderUsermaster.findOneAndUpdate({ _id: _id }, { $set: { profile: true } });
                  const response = await leaderUsermaster.findOne({ _id: _id });
                  return res.status(200).json({ status: true, message: "profile updated successfully", response });
              } else {
                  return res.status(401).json({ status: false, message: "could not create a profile, try later" });
              }
          } else {
              return res.status(401).json({ status: false, message: "Authentication failed" });
          }
      }
  } catch (err) {
      console.log(err);
      return res.status(400).send({ Status: 'Error', message: 'something went wrong' });
  }
};
exports.updateProfileCitizen = async (req, res) => {
  try {
      const { _id, lastname, firstname, email, dob, education, proffession, familymembers, languages, movies, music, books, dance, sports, otherintrests, location } = req.body;
      if (!_id) {
          return res.status(401).json({ status: true, message: "please provide all the details" });
      } else {
          const check2 = await citiZenUsermaster.findOneAndUpdate(
              { _id: _id },
              {
                  $set: {
                      familymembers: [],
                      languages: [],
                      "areaofintrest.movies": [],
                      "areaofintrest.music": [],
                      "areaofintrest.books": [],
                      "areaofintrest.dance": [],
                      "areaofintrest.sports": [],
                      "areaofintrest.otherintrests": []
                  }
              }
          );

          if (check2) {
              const check = await citiZenUsermaster.findOneAndUpdate({ _id: _id }, { $set: { firstname: firstname, lastname: lastname, email: email, dob: dob, education: education, proffession: proffession, location: location } });
              const check1 = await citiZenUsermaster.findOneAndUpdate(
                  { _id: _id },
                  {
                      $push: {
                          familymembers: { $each: familymembers },
                          languages: { $each: languages },
                          "areaofintrest.movies": { $each: movies },
                          "areaofintrest.music": { $each: music },
                          "areaofintrest.books": { $each: books },
                          "areaofintrest.dance": { $each: dance },
                          "areaofintrest.sports": { $each: sports },
                          "areaofintrest.otherintrests": { $each: otherintrests }
                      }
                  }
              );
              if (check && check1) {
                const user_id =new mongoose.Types.ObjectId(_id);
    await connection.updateMany(
      { 'connections._id': user_id },
      { $set: { 'connections.$.name':firstname} }
    );
    await post.updateMany({
      "likedpeopledata._id": user_id
    },{$set:{'likedpeopledata.$.name':firstname}});
   
   await likespost.updateMany({
      "likesofposts._id": user_id
    },{$set:{'likedpeopledata.$.name':firstname}});

    await comment.updateMany({
      "commentdetails._id": user_id
    },{$set:{'commentdetails.name':firstname}});

    await replycomment.updateMany({
      "commentdetails._id": user_id
    },{ $set: { 'commentlikerDetails.$.name':firstname} })

    await connection.updateMany({
      "totalrequest._id": user_id
    },{$set:{'totalrequest.$.name':firstname}})

    await notifications.updateMany({accpeted_id:user_id},
      { $set: { "accpeted.body":`${firstname} Connected With You`} }, { new: true })
    await notifications.updateMany({requested_id:user_id},
      { $set: { "request.body":`${firstname} would like to connect with you` } }, { new: true })
    await notifications.updateMany({post_liker_id:user_id},
      { $set: {"likespost.body": `${firstname} Liked your Post` } }, { new: true })
    await notifications.updateMany({post_commenter_id:user_id},
      { $set: {"comment.body": `${firstname} Commented On your Post` } }, { new: true })
    await notifications.updateMany({replyCommenter_id:user_id},
      { $set: {"replyComment.body":`${firstname} Commented On your Post`} }, { new: true })
    await notifications.updateMany({replyCommente_liker_id:user_id},
      { $set: { "replyCommentlike.body": `${firstname} Liked your Comment` } }, { new: true })
    await notifications.updateMany({commente_liker_id:user_id},
      { $set: {"likecomment.body": `${firstname} Liked your Comment` } }, { new: true })
    await notifications.updateMany({mentioner_id:user_id},
      { $set: {"mentioned.body":  `${firstname} Mentioned You On Comment`  } }, { new: true })  
                  await citiZenUsermaster.findOneAndUpdate({ _id: _id }, { $set: { profile: true } });
                  const response = await citiZenUsermaster.findOne({ _id: _id });
                  return res.status(200).json({ status: true, message: "profile updated successfully", response });
              } else {
                  return res.status(401).json({ status: false, message: "could not create a profile, try later" });
              }
          } else {
              return res.status(401).json({ status: false, message: "Authentication failed" });
          }
      }
  } catch (err) {
      console.log(err);
      return res.status(400).send({ Status: 'Error', message: 'something went wrong' });
  }
};
