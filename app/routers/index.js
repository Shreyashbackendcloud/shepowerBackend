const express = require('express')
const route = express.Router();

const {authMiddleware} = require('../services/verifyjwt')
//controllers
const regisController=require('../controllers/registration')
const profileController=require('../controllers/profile')
const adminController=require('../controllers/admin')
const settingController=require('../controllers/settings')
const postController=require('../controllers/posts')
const chatController=require('../controllers/chatmodule')
const eventController=require('../controllers/event')
const sosController=require('../controllers/sos')
const weshareSchema=require('../controllers/weshare')
//middlewares
const {upload , compresssosProfileImg } = require('../middleware/s3Bucket')
const { uploadProfile, compressProfileImg }=require('../middleware/uploadProfie')
const {postUpload,compressedPostUpload}=require('../middleware/uploadPost');
const {attachment,compressedattachment}=require('../middleware/uploadAttachment');
const {attachments,compressedattachments}=require('../middleware/sos')
const event = require('../models/event');
const registrationcitizen = require('../models/registrationcitizen');
//login module
route.post('/registrationcitizen',regisController.registrationcitizen)
route.post('/registrationleader',regisController.registrationleader)
route.post('/otpVerifycitizen',regisController.otpVerifycitizen)
route.post('/otpVerifyleader',regisController.otpVerifyleader)
route.post('/loginViaOtpcitizen',regisController.loginViaOtpcitizen)
route.post('/loginViaOtpleader',regisController.loginViaOtpleader)
route.post('/SplashScreen',regisController.SplashScreen)
route.post('/logoutCheck',regisController.logoutCheck)
route.post('/deeplink',authMiddleware,regisController.deeplink)
route.post('/findleaders',authMiddleware,regisController.findleaders)

//profilecontroller
route.put('/createProfileCitizen',authMiddleware,profileController.createProfileCitizen)
route.put('/createProfileLeader',authMiddleware,profileController.createProfileLeader)
route.put(
    '/createProfileConselingWithSos', 
    upload.fields([
      { name: 'id_card.front', maxCount: 1 },
      { name: 'id_card.back', maxCount: 1 },
      { name: 'address_proof.front', maxCount: 1 },
      { name: 'address_proof.back', maxCount: 1 },
      { name: 'certificate_ngo_or_institute.front', maxCount: 1 },
      { name: 'certificate_ngo_or_institute.back', maxCount: 1 },
    ]),
    compresssosProfileImg, 
    profileController.createProfileConselingWithSos 
  );
route.put('/createProfileCitizenimg',authMiddleware,uploadProfile.single('profile_img'),compressProfileImg,profileController.createProfileCitizenimg)
route.put('/createProfileLeaderimg',authMiddleware,uploadProfile.single('profile_img'),compressProfileImg,profileController.createProfileLeaderimg)
route.put('/updateProfileCitizen',authMiddleware,profileController.updateProfileCitizen)
route.put('/updateProfileLeader',authMiddleware,profileController.updateProfileLeader)
route.post('/getAllProfile',authMiddleware,profileController.getAllProfile)
route.post('/getOtherprofile',authMiddleware,profileController.getOtherprofile)
route.get('/getMyprofile/:_id',authMiddleware,profileController.getMyprofile)
route.put('/updateProfileCitizenimg',authMiddleware,uploadProfile.single('profile_img'),compressProfileImg,profileController.updateProfileCitizenimg)
route.put('/updateProfileLeaderimg',authMiddleware,uploadProfile.single('profile_img'),compressProfileImg,profileController.updateProfileLeaderimg)

route.get('/getLanguages',authMiddleware,profileController.getLanguages)


//connection module Starts 
route.post('/acceptRequest',authMiddleware,regisController.acceptRequest)
route.post('/rejectRequest',authMiddleware,regisController.rejectRequest)
route.get('/getNotification/:_id',authMiddleware,regisController.getNotification)
route.get('/getRequest/:_id',authMiddleware,regisController.getRequest)
route.get('/requestCount/:_id',authMiddleware,regisController.requestCount)
route.post('/sendRequestOrConnect',regisController.sendRequestOrConnect)
route.post('/getConnections',authMiddleware,regisController.getConnections)
route.post('/disconnectUsers',regisController.disconnectUsers)
route.get('/getNotificationCount/:_id',authMiddleware,regisController.getNotificationCount)


//connection module Ends 
//setting module
route.post('/securitySetting',authMiddleware,settingController.securitySetting)
route.post('/profileDataSetting',authMiddleware,settingController.profileDataSetting)
route.post('/blockContact',authMiddleware,settingController.blockContact)
route.post('/unBlockContact',authMiddleware,settingController.unBlockContact)
route.post('/getBlockContact',authMiddleware,settingController.getBlockContact)
route.post('/locationUpdatecitizen',authMiddleware,settingController.locationUpdatecitizen)
route.post('/nearbycitizens',authMiddleware,settingController.nearbycitizens)
route.post('/nearbyleaders',authMiddleware,settingController.nearbyleaders)
route.post('/weShearOnOff',authMiddleware,settingController.weShearOnOff)
route.post('/getAllCitizensapp',authMiddleware,settingController.getAllCitizensapp)
route.post('/getAllLeadersapp',authMiddleware,settingController.getAllLeadersapp)


//Explore post module STARTS 
route.post('/createPost',authMiddleware,postUpload.array('post'),compressedPostUpload,postController.createPost)
route.post('/editPostDetails',authMiddleware,postController.editPostDetails)
route.post('/getPostsOfAll',authMiddleware,postController.getPostsOfAll)
route.post('/likePost',authMiddleware,regisController.likePost)
route.post('/getLikesOfPost',authMiddleware,regisController.getLikesOfPost)
route.post('/addComment',authMiddleware,regisController.addComment)
route.post('/addReplyComment',authMiddleware,regisController.addReplyComment)
route.post('/likeComment',authMiddleware,regisController.likeComment)
route.post('/replyCommentlike',authMiddleware,regisController.replyCommentlike)
route.post('/getComment',authMiddleware,regisController.getComment)
route.delete('/deleteComment',authMiddleware,regisController.deleteComment)
route.delete('/deletePost',authMiddleware,postController.deletePost)
route.post('/getAllPostsofMe',authMiddleware,postController.getAllPostsofMe)
route.put ('/postBlock' ,authMiddleware,postController.postBlock)
//Explore post module ENDS

//chat module STARTS
route.post('/creategroup',authMiddleware,chatController.createGroupRoom)
route.put('/updategroupimage',authMiddleware,uploadProfile.single('profile_img'),compressProfileImg,chatController.createGroupUpdateImage)
route.put('/deleteperson',authMiddleware,chatController.deleteGroupMember)
route.put('/joingroup',authMiddleware,chatController.newJoingMemberinGroup)
route.delete('/deleteroom/:_id',authMiddleware,chatController.deleteroom)
route.put('/exitgroup/:_id',authMiddleware,chatController.exitGroup)
route.post('/storeMessage',authMiddleware,regisController.storeMessage)
route.get('/getmessage/:room_id',authMiddleware,chatController.getmessage)
route.post('/ChatHistory',authMiddleware,chatController.ChatHistory)
route.post('/sendAttachment',authMiddleware,attachment.array('attachment'),compressedattachment,regisController.sendAttachment);
route.post('/viewgroupinfo',authMiddleware,chatController.viewGroupInfo)
route.put('/updateProfilegroup/:_id',authMiddleware,uploadProfile.single('profile_img'),compressProfileImg,chatController.updateProfileGroup)
route.delete('/clearChat/:room_id',authMiddleware,chatController.clearChat)
route.delete('/deleteMesage',authMiddleware,chatController.deleteMesage)
route.post('/sendRequestGroup',authMiddleware,regisController.sendRequestGroup)
route.post('/rejectGroupRequest',authMiddleware,regisController.rejectGroupRequest)
route.post('/acceptGroupRequest',authMiddleware,regisController.acceptGroupRequest)
route.post('/createChat',authMiddleware,chatController.createChat)
route.post('/online',authMiddleware,chatController.userlogin)
route.post('/offline',authMiddleware,chatController.userOffline)
route.post('/getuseronlineorofline',authMiddleware,chatController.getuseronlineorofline)
route.post('/isChatRoom',authMiddleware,chatController.isChatRoom)
route.post('/isNotChatRoom',authMiddleware,chatController.isNotChatRoom)
route.post('/getAllGroups',authMiddleware,chatController.getAllGroups)
//chat module ENDS


//event model STARTS
route.post('/createEvent',authMiddleware,attachment.array('event_img'), compressedattachment,eventController.createEvent)
route.post('/getLiveEvents',authMiddleware,eventController.getLiveEvents)
route.post('/upcomingEvent',authMiddleware,eventController.upcomingEvent)
route.post('/myEvents',authMiddleware,eventController.myEvents)
route.get('/getAllEvents',authMiddleware,eventController.getAllEvents)
route.get('/getEvents/:id',authMiddleware,eventController.getEvents)
route.put('/updateEvent',authMiddleware,uploadProfile.single('event_img'), compressProfileImg,eventController.updateEvent)
route.delete('/deleteEvent',authMiddleware,eventController.deleteEvent)
//event model ENDS

//sos model Starts
route.post('/locationUpdate',authMiddleware,sosController.locationUpdate)
route.post('/createSos',authMiddleware,attachments.single("attachment"),compressedattachments,regisController.createSos)
route.post('/getSosData',authMiddleware,sosController.getSosData)
route.post('/closeSos',authMiddleware,regisController.closeSos)
route.post('/acceptSos',authMiddleware,regisController.acceptSos)
route.post('/ongoingSos',authMiddleware,sosController.ongoingSos)
route.post('/completedSos',authMiddleware,sosController.completedSos)
route.post('/commentsSos',authMiddleware,sosController.commentsSos)
route.get('/getSosComments',authMiddleware,sosController.getSosComments)
route.post('/addratingandreview',authMiddleware,sosController.addratingandreview)
route.get('/getratingsReview',authMiddleware,sosController.getratingsReview)
route.post('/replyCommentsSos',authMiddleware,sosController.replyCommentsSos)
route.get('/getAllratingsReview',authMiddleware,sosController.getAllratingsReview)


//sos model Ends


//weshare Module
route.post('/createShare',authMiddleware,weshareSchema.createShare)
route.post('/getMyShares',authMiddleware,weshareSchema.getMyShares)
route.post('/getAllShare',authMiddleware,weshareSchema.getAllShare)
route.delete('/deleteShare',authMiddleware,weshareSchema.deleteShare)

//payment Getway 

route.post('/createOrder',authMiddleware,profileController.createOrder)
route.post('/gettokens',authMiddleware,profileController.gettokens)
route.post('/verifyorder',authMiddleware,profileController.verifyorder)
route.post('/refund',authMiddleware,profileController.refund)
route.post('/getPayments',authMiddleware,profileController.getPayments)
route.post('/getAllPayments',authMiddleware,profileController.getAllPayments)






// route.post('/gettokens',regisController.gettokens)
// route.post('/verifyOrder',regisController.verifyOrder)
// route.post('/refund',regisController.refund)


//payment getway end 


// //admin API STARTS
// route.post('/adminRegistration',adminController.adminRegistration);
// route.post('/adminLogin',adminController.adminLogin);
// route.get('/getAllUsers',adminController.getAllUsers)
// route.post('/newusers',adminController.newusers)
// route.get('/totalUsersCount',adminController.totalUsersCount)
// route.get('/totalCitizensCount',adminController.totalCitizensCount);
// route.get('/totalLeaderCount',adminController.totalLeaderCount);
// route.get('/getAllLeaders',adminController.getAllLeaders);
// route.get('/getAllCitizens',adminController.getAllCitizens);
// route.post('/addCategory',adminController.addCategory)
// route.get('/getCategory',adminController.getCategory);
// route.patch('/updateCategory',adminController.updateCategory);
// route.delete('/deleteCategory/:id',adminController.deleteCategory);
// route.post('/addSubCategory',adminController.addSubCategory)
// route.get('/getSubCategory',adminController.getSubCategory);
// route.patch('/updateSubCategory',adminController.updateSubCategory);
// route.delete('/deleteSubCategory/:id',adminController.deleteSubCategory);
// route.post('/adminBlock',adminController.adminBlock)
// route.get('/connectionsOfAll',adminController.connectionsOfAll)
// route.get('/postOfOfAll',adminController.postOfOfAll)
// route.get('/groupCount',adminController.groupCount)
// route.get('/groupmanagement',adminController.groupmanagement)
// route.get('/allEvents',adminController.allEvents)
// route.post('/groupBlockUnblock',adminController.groupBlockUnblock)
// route.post('/allUserNotification',authMiddleware,uploadProfile.single('image'),compressProfileImg,regisController.allUserNotification)
// route.post('/citizenNotification',authMiddleware,uploadProfile.single('image'),compressProfileImg,regisController.citizenNotification)
// route.post('/leaderNotification',authMiddleware,uploadProfile.single('image'),compressProfileImg,regisController.leaderNotification)
// route.get('/getnotificationAdmin',authMiddleware,regisController.getnotificationAdmin)
// route.get('/getSosAdmin',adminController.getSosAdmin)
// route.get('/getPostBlock',adminController.getPostBlock)
// route.post('/addFAQ',adminController.addFAQ)
// route.get('/getAllFAQ',adminController.getFAQ)
// route.patch('/updateFAQ',adminController.updateFAQ);
// route.delete('/deleteFAQ',adminController.deleteFAQ);
// route.post('/addLanguages' ,adminController.addLanguages)
// route.patch('/updateLanguages',adminController.updateLanguages)
// route.post('/deleteLanguage',adminController.deleteLanguage)

// //--------------TAC-----------------------//
// route.post('/addTAC',adminController.addTAC)
// route.get('/getAllTAC',adminController.getAllTAC)
// route.patch('/updateTAC',adminController.updateTAC);
// route.delete('/deleteTAC/:id',adminController.deleteTAC);

// //------------PAP---------------//
// route.post('/addPAP',adminController.addPAP)
// route.get('/getAllPAP',adminController.getAllPAP)
// route.patch('/updatePAP',adminController.updatePAP);
// route.delete('/deletePAP/:id',adminController.deletePAP);


// //------------postBlock -----------------//


// route.get('/getPostBlock',adminController.getPostBlock)

//admin API ENDS


// route.post('/addAboutApp',authMiddleware,adminController.addAboutApp)
// route.post('/updateAboutApp',authMiddleware,adminController.updateAboutApp)
// route.post('/deleteAboutApp',authMiddleware,adminController.deleteAboutApp)
// route.post('/getAboutApp',authMiddleware,adminController.getAboutApp)  
// route.get('/getAllShareCitizen',authMiddleware,adminController.getAllShareCitizen)
// route.get('/getAllShareLeader',authMiddleware,adminController.getAllShareLeader)

// // route.post('/gettokens',regisController.gettokens)
// // route.post('/verifyOrder',regisController.verifyOrder)
// // route.post('/refund',regisController.refund)


// //payment getway end 


//admin API STARTS
route.post('/adminRegistration',adminController.adminRegistration);
route.post('/adminLogin',adminController.adminLogin);
route.get('/getAllUsers',authMiddleware,adminController.getAllUsers)
route.post('/newusers',authMiddleware,adminController.newusers)
route.get('/totalUsersCount',authMiddleware,adminController.totalUsersCount)
route.get('/totalCitizensCount',authMiddleware,adminController.totalCitizensCount);
route.get('/totalLeaderCount',authMiddleware,adminController.totalLeaderCount);
route.get('/getAllLeaders',authMiddleware,adminController.getAllLeaders);
route.get('/getAllCitizens',authMiddleware,adminController.getAllCitizens);
route.post('/addCategory',authMiddleware,adminController.addCategory)
route.get('/getCategory',authMiddleware,adminController.getCategory);
route.patch('/updateCategory',authMiddleware,adminController.updateCategory);
route.delete('/deleteCategory/:id',authMiddleware,adminController.deleteCategory);
route.post('/addSubCategory',authMiddleware,adminController.addSubCategory)
route.get('/getSubCategory',authMiddleware,adminController.getSubCategory);
route.patch('/updateSubCategory',authMiddleware,adminController.updateSubCategory);
route.delete('/deleteSubCategory/:id',authMiddleware,adminController.deleteSubCategory);
route.post('/adminBlock',authMiddleware,adminController.adminBlock)
route.get('/connectionsOfAll',authMiddleware,adminController.connectionsOfAll)
route.get('/postOfOfAll',authMiddleware,adminController.postOfOfAll)
route.get('/groupCount',authMiddleware,adminController.groupCount)
route.get('/groupmanagement',authMiddleware,adminController.groupmanagement)
route.get('/allEvents',authMiddleware,adminController.allEvents)
route.post('/groupBlockUnblock',authMiddleware,adminController.groupBlockUnblock)
route.post('/allUserNotification',authMiddleware,uploadProfile.single('image'),compressProfileImg,regisController.allUserNotification)
route.post('/citizenNotification',authMiddleware,uploadProfile.single('image'),compressProfileImg,regisController.citizenNotification)
route.post('/leaderNotification',authMiddleware,uploadProfile.single('image'),compressProfileImg,regisController.leaderNotification)
route.get('/getnotificationAdmin',authMiddleware,regisController.getnotificationAdmin)
route.get('/getSosAdmin',authMiddleware,adminController.getSosAdmin)
route.get('/getPostBlock',authMiddleware,adminController.getPostBlock)
route.post('/addFAQ',authMiddleware,adminController.addFAQ)
route.get('/getAllFAQ',authMiddleware,adminController.getFAQ)
route.patch('/updateFAQ',authMiddleware,adminController.updateFAQ);
route.delete('/deleteFAQ',authMiddleware,adminController.deleteFAQ);
route.post('/addLanguages' ,authMiddleware,adminController.addLanguages)
route.patch('/updateLanguages',authMiddleware,adminController.updateLanguages)
route.post('/deleteLanguage',authMiddleware,adminController.deleteLanguage)

//--------------TAC-----------------------//
route.post('/addTAC',authMiddleware,adminController.addTAC)
route.get('/getAllTAC',authMiddleware,adminController.getAllTAC)
route.patch('/updateTAC',authMiddleware,adminController.updateTAC);
route.delete('/deleteTAC/:id',authMiddleware,adminController.deleteTAC);

//------------PAP---------------//
route.post('/addPAP',authMiddleware,adminController.addPAP)
route.get('/getAllPAP',authMiddleware,adminController.getAllPAP)
route.patch('/updatePAP',authMiddleware,adminController.updatePAP);
route.delete('/deletePAP/:id',authMiddleware,adminController.deletePAP);


route.post('/addAboutApp',authMiddleware,adminController.addAboutApp)
route.post('/updateAboutApp',authMiddleware,adminController.updateAboutApp)
route.post('/deleteAboutApp',authMiddleware,adminController.deleteAboutApp)
route.post('/getAboutApp',authMiddleware,adminController.getAboutApp)  
route.get('/getAllShareCitizen',authMiddleware,adminController.getAllShareCitizen)
route.get('/getAllShareLeader',authMiddleware,adminController.getAllShareLeader)


//------------postBlock -----------------//


route.get('/getPostBlock',authMiddleware,adminController.getPostBlock)

//admin API ENDS






module.exports = route;