const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      default: "",
    },
    lastname: {
      type: String,
      default: "",
    },
    mobilenumber: {
      type: Number,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    dob: {
      type: Date,
      default: "",
    },
    dobsettings: {
      public: {
        type: Boolean,
        default: true,
      },
      private: {
        type: Boolean,
        default: false,
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    education: {
      type: String,
      default: "",
    },
    educationsettings: {
      public: {
        type: Boolean,
        default: true,
      },
      private: {
        type: Boolean,
        default: false,
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    profile_img: {
      type: String,
      set: (icon) => {
        if (icon) {
          return icon;
        }
        return;
      },
      default: " ",
    },
    proffession: {
      type: String,
      default: "",
    },
    proffessionsettings: {
      public: {
        type: Boolean,
        default: true,
      },
      private: {
        type: Boolean,
        default: false,
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    location: {
      type: String,
      default: "",
    },
    locationsionsettings: {
      public: {
        type: Boolean,
        default: true,
      },
      private: {
        type: Boolean,
        default: false,
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    familymembers: {
      type: Array,
      default: [],
    },
    familymemberssionsettings: {
      public: {
        type: Boolean,
        default: true,
      },
      private: {
        type: Boolean,
        default: false,
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    languages: {
      type: Array,
      default: [],
    },
    languagessionsettings: {
      public: {
        type: Boolean,
        default: true,
      },
      private: {
        type: Boolean,
        default: false,
      },
      connected: {
        type: Boolean,
        default: false,
      },
    },
    areaofintrest: {
      movies: {
        type: Array,
        default: [],
      },
      moviessettings: {
        public: {
          type: Boolean,
          default: true,
        },
        private: {
          type: Boolean,
          default: false,
        },
        connected: {
          type: Boolean,
          default: false,
        },
      },
      music: {
        type: Array,
        default: [],
      },
      musicsettings: {
        public: {
          type: Boolean,
          default: true,
        },
        private: {
          type: Boolean,
          default: false,
        },
        connected: {
          type: Boolean,
          default: false,
        },
      },
      books: {
        type: Array,
        default: [],
      },
      bookssettings: {
        public: {
          type: Boolean,
          default: true,
        },
        private: {
          type: Boolean,
          default: false,
        },
        connected: {
          type: Boolean,
          default: false,
        },
      },
      dance: {
        type: Array,
        default: [],
      },
      dancesettings: {
        public: {
          type: Boolean,
          default: true,
        },
        private: {
          type: Boolean,
          default: false,
        },
        connected: {
          type: Boolean,
          default: false,
        },
      },
      sports: {
        type: Array,
        default: [],
      },
      sportssettings: {
        public: {
          type: Boolean,
          default: true,
        },
        private: {
          type: Boolean,
          default: false,
        },
        connected: {
          type: Boolean,
          default: false,
        },
      },
      otherintrests: {
        type: Array,
        default: [],
      },
      othersettings: {
        public: {
          type: Boolean,
          default: true,
        },
        private: {
          type: Boolean,
          default: false,
        },
        connected: {
          type: Boolean,
          default: false,
        },
      },
    },
    otp: {
      type: Boolean,
      default: "false",
    },
    profile: {
      type: Boolean,
      default: "false",
    },
    token: {
      type: String,
      default: "",
    },

    profileID: {
      type: String,
      default: "",
    },
    adminBlock: {
      type: Boolean,
      default: false,
    },
    //  created this uc 
    user_type: {
      type: String,
      enum: ["Counsellor", "counsellorWithSos"],
      default: "Counsellor",
    },

    
      id_card: {
        front: {
          type: String, 
        },
        back: {
          type: String, 
        },
      },

      
      address_proof: {
        front: {
          type: String, 
        },
        back: {
          type: String, 
        },
      },
      certificate_ngo_or_institute: {
        front: {
          type: String, 
        },
        back: {
          type: String, 
        },
      },




    public: {
      type: Boolean,
      default: true,
    },
    // end uc 


    private: {
      type: Boolean,
      default: false,
    },
    connected: {
      type: Boolean,
      default: false,
    },
    blockContact: {
      type: Array,
      default: [],
    },

    // customer_Id: {
    //   type: String,
    //   default: "",
    // },
    weShearOnOff: {
      type: Boolean,
      default: true,
    },
    // sos_dangeorus_list : [ 
    //     {
    //         ""
    //     }
    // ]
  },
  { timestamps: true }
);
module.exports = mongoose.model(
  "leaderusermasters",
  userSchema,
  "leaderusermasters"
);
