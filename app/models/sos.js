const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sosSchema = new Schema({
      user_id:{
                type:Object,
                default:''
            },
            location:{
                latitude: {
                    type: Number,
                    default:""
                    
                  },
                 longitude: {
                    type: Number,
                    default:""
                    
                  },
                },
                attachment:{
                    type: String, 
                    default:" "
                },
                text:{
                    type:String,
                },
                leaders:{
                  type:Object ,
                },
                sosId:{
                  type: String,
                    default:" "
                },
                closed:{
                  type:Boolean,
                  default:false
                },

                accptedleader:{
                  type:Array ,
                  default:[]
                },
                notificationCount:{
                  type:Number,
                },
                types_of_danger: {
                  type: [String]  
                },
                local_Police_Helpline: {
                  type: [String]  
              }
                
              },{ timestamps: true });

module.exports = mongoose.model('sos', sosSchema, 'sos');

