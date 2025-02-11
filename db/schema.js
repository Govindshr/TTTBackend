const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;


const questionSchema = new mongoose.Schema({
    // scenario: String,
    question: String,
    pre: String,
    options: {
        type: Array,
        default: [
            {
                option: String,
                next: String
            }
        ]
    },
    tables: [],
    files: [],
    linked: {},
    scene: String,
    newData: { default: 1, type: Number },
    start: { type: Number, default: 0 },

    created_date: {
        type: Date,
        default: Date.now
    },

    is_final: { type: Number, default: 0 },
    type: String

});
const Question = mongoose.model("Questions", questionSchema);




/**************************** Schema For TRIPPING TALES ****************************** */

const registrationSchema = new mongoose.Schema({
    profile_image: String,
    name: String,
    mobile_number: String,
    email: String,
    password: String,
    address: String,
    user_role: String,
    category: String,
    admin_id: String,
    is_deleted: { type: Number, default: 0 },
    status: { type: Number, default: 1 }

}
    , { timestamps: true   });
const Registration = mongoose.model("registrations", registrationSchema);

// Destination Schema
const DestinationSchema = new mongoose.Schema({
    destination_name: { type: String, required: true },
    description: { type: String },
    cover_image: { type: String },
    privacy_policy: { type: String },
    taxes: { type: String, default: 0 },
    fees: { type: String, default: 0 },
    images: [{ type: String }], // Array of image URLs
    faqs: [
        // {
        //     question: { type: String, required: true },
        //     answer: { type: String, required: true }
        // }
    ],
    status: { type: Number, default: 1 },
    is_deleted: { type: Number, default: 0 }
}, { timestamps: true });
const Destination = mongoose.model('Destination', DestinationSchema);

// Itinerary Schema
const ItinerarySchema = new mongoose.Schema(
    {
        itinerary_title: { type: String, required: true },
        destination: { type: mongoose.Schema.Types.ObjectId }, // Reference to Destination
        additional_information: { type: String, default: "" },
        cover_image: { type: String, default: "" },
        days_and_night: { type: String, required: true },
        current_price: { type: Number, required: true },
        original_price: { type: Number, required: true },
        saving: { type: Number, default: 0 },
        images: { type: [String], default: [] },
        trip_highlights: [],
        prerequisites_knowledge: { type: String, default: "" },
        destination_name: { type: String, default: "" },
        day_wise_itinerary: [],
        status: { type: String, enum: ["active", "inactive"], default: "inactive" },
        inclusions: [],
        exclusions: [],
        faqs: [
            // {
            //     question: { type: String, required: true },
            //     answer: { type: String, required: true }
            // }
        ],
        status: { type: Number, default: 1 },
        is_deleted: { type: Number, default: 0 }
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Itinerary = mongoose.model("Itinerary", ItinerarySchema);

// Destination with Type Schema
const DestinationWithTypeSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            // enum: ["adventure", "leisure", "honeymoon", "family", "business"], // Example categories
        },
        destinationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Destination", // Reference to the Destination collection
            required: true
        },
        status: { 
            type: Number, 
            default: 1 
        },
        is_deleted: { 
            type: Number, 
            default: 0 
        }
    },
    { timestamps: true } // This will automatically add createdAt and updatedAt fields
);

const DestinationWithType = mongoose.model("DestinationWithType", DestinationWithTypeSchema);

const ItinerariesWithTypeSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true
        },
        itineraryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Itinerary", // Reference to the Itinerary collection
            required: true
        },
        status: { type: Number, default: 1 },
        is_deleted: { type: Number, default: 0 }
    },
    { timestamps: true }
);

const ItinerariesWithType = mongoose.model("ItinerariesWithType", ItinerariesWithTypeSchema);


const HolidaysByThemeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        images: [{ type: String }], // Array of image URLs
        status: { type: Number, default: 1 }, // 1 = Active, 0 = Inactive
        is_deleted: { type: Number, default: 0 } // 0 = Not Deleted, 1 = Deleted
    },
    { timestamps: true }
);

const HolidaysByTheme = mongoose.model("HolidaysByTheme", HolidaysByThemeSchema);


// Testimonial Schema Definition
const TestimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // 'name' is a required field
    },
    description: {
      type: String,
      required: true, // 'description' is a required field
    },
    images: [{ type: String }], // Array of image URLs
    rating: {
      type: Number,
      required: true, // 'rating' is a required field
      min: 1,  // Assuming the rating range is between 1 to 5
      max: 5,
    },
    status: {
      type: Number,
      default: 1 // Default status is active (1)
    },
    is_deleted: {
      type: Number,
      default: 0, // Default is not deleted (0), 1 for deleted
    },
  },
  { timestamps: true } // Automatically adds 'createdAt' and 'updatedAt' timestamps
);

// Create and export the Testimonial model
const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

// Partner Schema Definition
const partnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    images: {
        type: [String], // An array of image paths
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Partner = mongoose.model('Partner', partnerSchema);

// Vendor Schema Definition
const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    images: [{
        type: String,
        required: false // Optional images array
    }],
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // to manage active/inactive status
    is_deleted: { type: Boolean, default: false }
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);



const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone_number: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        default: ''
    },
    lead_type: {
        type: String,
        enum: ['general', 'destination', 'itinerary'],
        required: true
    },
    lead_status: {
        type: String,
        enum: ['new', 'in-progress', 'converted', 'closed'],
        default: 'new'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    destination_details: {
        type: String,
        default: '', // Required if lead_type is 'destination'
    },
    itinerary_details: {
        type: String,
        default: '', // Required if lead_type is 'itinerary'
    }
}, {
    timestamps: true
});
const Lead = mongoose.model("Lead", leadSchema);


const agentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    number: {
        type: String,
        required: true,
        trim: true
    },
    secondary_number: {
        type: String,
        trim: true
    },
    salary: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    education_status: {
        type: String,
        // enum: ['Not Completed', 'Completed', 'Graduated', 'Post Graduate'],
        required: true
    },
    DOB: {
        type: Date,
        required: true
    },
    skills: {
        type: [String], // Array of skills
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    profile_photo: {
        type: String, // URL or file path to the profile photo
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Agent = mongoose.model("Agent", agentSchema);






module.exports = {

    Registration,
    Question,
    Destination,
    Itinerary,
    DestinationWithType,
    ItinerariesWithType,
    HolidaysByTheme,
    Testimonial,
    Partner,
    Vendor,
    Lead,
    Agent,



}