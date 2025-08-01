const path = require("path");
const fs = require("fs");


const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var moment = require('moment');
const ObjectId = require('mongoose').Types.ObjectId;
const multer = require('multer');

const secretKey = 'kms-ak-node';
const handler = require('./api.handler')

const { Question,  Registration, Destination, Itinerary, DestinationWithType, 
    ItinerariesWithType, HolidaysByTheme, Testimonial, Partner, Vendor, Lead, Agent,JourneysInFrame,Terms,Privacy,Copyright

} = require("./db/schema");
const { Mongoose, default: mongoose } = require("mongoose");



// Protected route using the verifyToken middleware ////////////////////////////////
exports.protected =  (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
};

/*************************** Upload Documents API for Query ********************** */
exports.uploadDocuments = (req, res) => {

    res.status(200).json({
        error: false,
        code: 200,
        message: "File Upload Successfully",
        file: req.file.filename
    })
};

/*************************** Get Documents API for Query ************************* */
exports.file = (req, res) => {
    fs.readFile("uploads/" + req.params.path, (err, data) => {
        console.log(err)
        res.end(data)
    })
};

/*************************** Login API for Users in KMS ************************** */
exports.login = async (req, res) => {
    console.log("/login")

    try {
        let email = req.body.email ? req.body.email : ""
        let password1 = req.body.password ? req.body.password : ""
        let user = await Registration.findOne({ email: email.toLowerCase().trim() })
        if (user === null) {
            res.status(202).json({
                error: true,
                code: 202,
                message: "User not found.",
            })
        }
        else {
            const token = jwt.sign({ email }, secretKey);
            const isMatch = await handler.decryptPassword(password1, user.password)
            if (isMatch) {
                res.status(201).json({
                    error: false,
                    code: 201,
                    message: "User Logged In",
                    result: user,
                    token: token
                })
            }
            else {
                return res.status(202).send({
                    message: "Wrong Password"
                });
            }
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    }

};

/************************ Registration API for Users in KMS ************************ */


exports.Registration = async (req, res) => {
    try {
        // let profile_image = req.files["profile_image"] ? req.files["profile_image"][0].filename : "";
        let { name, mobile_number, email, password, user_role, admin_id, category } = req.body;
        let bPassword = await handler.bcryptPassword(password);


        let existingUser = await Registration.findOne({ mobile_number });
        if (existingUser) {
            return res.status(400).json({ error: true, message: "Mobile number already exists" });
        }

        let newUser = new Registration({
            // profile_image,
            name,
            mobile_number,
            email: email.toLowerCase().trim(),
            password: bPassword,
            user_role,
            admin_id,
            category,
        });

        let result = await newUser.save();
        res.status(200).json({ error: false, message: "Registered Successfully", data: result });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Update User
exports.UpdateUser = async (req, res) => {
    try {
        let profile_image = req.files["profile_image"] ? req.files["profile_image"][0].filename : null;
        let { userId, name, mobile_number, email, user_role, admin_id, category } = req.body;

        let updateData = { name, mobile_number, email, user_role, admin_id, category };
        if (profile_image) updateData.profile_image = profile_image;

        let updatedUser = await Registration.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) return res.status(404).json({ error: true, message: "User not found" });

        res.status(200).json({ error: false, message: "User updated successfully", data: updatedUser });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Delete User
exports.DeleteUser = async (req, res) => {
    try {
        let { userId } = req.body;
        let deletedUser = await Registration.findByIdAndDelete(userId);
        if (!deletedUser) return res.status(404).json({ error: true, message: "User not found" });

        res.status(200).json({ error: false, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Get User by ID
exports.GetUserById = async (req, res) => {
    try {
        let { userId } = req.body;
        let user = await Registration.findById(userId);
        if (!user) return res.status(404).json({ error: true, message: "User not found" });

        res.status(200).json({ error: false, message: "User retrieved successfully", data: user });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Get All Users
exports.GetAllUsers = async (req, res) => {
    try {
        let users = await Registration.find();
        res.status(200).json({ error: false, message: "Users retrieved successfully", data: users });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};

// Get Users by Role
exports.GetUsersByRole = async (req, res) => {
    try {
        let { role } = req.body;
        let users = await Registration.find({ user_role: role });
        res.status(200).json({ error: false, message: "Users retrieved successfully", data: users });
    } catch (error) {
        res.status(500).json({ error: true, message: "Something went wrong", data: error.message });
    }
};




/************************ Save Question and Options of KMS ************************* */
exports.saveQuestion = async (req, res) => {
    console.log("/saveQuestion")

    // console.log(req.body.data[0].options)
    let count = 0
    let data = req.body.data
    let savedQuestion
    try {
        for (let i = 0; i < data.length; i++) {
            let question = data[i].question ? data[i].question : ""
            let type = data[i].type ? data[i].type : "text"
            let options = data[i].options ? data[i].options : []
            let tables = data[i].tables ? data[i].tables : []
            let pre = data[i].pre ? data[i].pre : ""
            let scene = req.body.scene
            

            let saveData = {

                question: question,
                pre: pre,
                options: options,
                tables: tables,
                scene: scene,
                start: data[i].start ? data[i].start : 0,
                files:data[i].files?data[i].files:[],
                linked:data[i].linked?data[i].linked:{},
                type:type

            }

            Question.create(saveData).then((result) => {
                console.log(result)
                if (result.start) {
                    savedQuestion = result
                }

                if (result) {
                    count++
                    if (count == data.length) {
                        scenario_details.updateOne({ _id: scene }, { $set: { actionId: savedQuestion._id } }).then((data) => {
                            res.status(200).json({
                                error: false,
                                code: 200,
                                message: "Save Successfully",
                                data: savedQuestion
                            })
                        })
                    }

                } else {
                    res.status(404).json({
                        error: true,
                        code: 404,
                        message: "",
                    })
                }
            })
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: true,
            code: 400,
            message: "sonthing went worng",
            data: error
        })
    }

};

/******************** Get Question By Next and Pre Action Id Id of KMS ************* */
exports.getQuestionById = async (req, res) => {
    console.log("/getQuestionById")

    try {
        const actionId = req.body.actionId ? req.body.actionId : null
        const question = await Question.find({ pre: actionId });
        console.log('find');
        if (question) {
            console.log(question.length);
            res.status(201).json({
                error: false,
                code: 201,
                message: "Question Fetched Successfully",
                data: question
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(400).send(error);
    }

};


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/************************************* TRIPPING_TALES_API_START************************************ */


/************************  Destination API ************************* */

// exports.saveDestination = async (req, res) => {
//     console.log("/saveDestination API called");

//     let data = req.body;
//     let savedDestination;

//     try {
//         // Extract values from the request body
//         let destination_name = data.destination_name || "";
//         let description = data.description || "";
//         let privacy_policy = data.privacy_policy || "";
//         let taxes = data.taxes || 0;
//         let fees = data.fees || 0;
//         let faqs = data.faqs ? JSON.parse(data.faqs) : []; // Parse faqs from JSON string
//         let scene = data.scene || "";  // Assuming scene is also passed as a form-data field

//         // Handle uploaded files
//         let cover_image = req.files?.cover_image ? req.files.cover_image[0].path : "";
//         let images = req.files?.images ? req.files.images.map(file => file.path) : [];

//         // Prepare data for saving
//         let saveData = {
//             destination_name,
//             description,
//             privacy_policy,
//             taxes: taxes,
//             fees: fees,
//             cover_image,
//             images,
//             faqs,
//             scene
//         };

//         // Save the data to the database
//         savedDestination = await Destination.create(saveData);

//         // Respond with success
//         res.status(200).json({
//             error: false,
//             code: 200,
//             message: "Saved Successfully",
//             data: savedDestination
//         });
//     } catch (error) {
//         console.error("Catch Error:", error);
//         res.status(400).json({
//             error: true,
//             code: 400,
//             message: "Something went wrong",
//             data: error
//         });
//     }
// };

exports.saveDestination = async (req, res) => {
    console.log("/saveDestination API called");

    let data = req.body;
    let savedDestination;

    try {
        let destination_name = data.destination_name || "";
        let destination_title = data.destination_title || "";
        let mainbanner_text = data.mainbanner_text || "";
        let destination_overview = data.destination_overview || "";
        let description = data.description || "";
        let privacy_policy = data.privacy_policy || "";
        let taxes = data.taxes || 0;
        let fees = data.fees || 0;
        let faqs = data.faqs ? JSON.parse(data.faqs) : [];
        let scene = data.scene || "";

        let cover_image = req.files?.find(file => file.fieldname === "cover_image")?.path || "";
        let images = req.files?.filter(file => file.fieldname === "images").map(file => file.path) || [];

        // **Step 1: Parse `site_seeing` Data from JSON**
        let site_seeing = [];
        if (data.site_seeing) {
            try {
                site_seeing = typeof data.site_seeing === "string" ? JSON.parse(data.site_seeing) : data.site_seeing;
            } catch (error) {
                console.error("JSON Parse Error for site_seeing:", error);
            }
        }

        // **Step 2: Assign Uploaded Images to Site Seeing Details**
        if (req.files) {
            console.log("Uploaded Files:", req.files); // Debugging Log

            req.files.forEach((file) => {
                let match = file.fieldname.match(/site_seeing\[(\d+)\]\[details\]\[(\d+)\]\[image\]/);
                if (match) {
                    let sIndex = parseInt(match[1]);
                    let dIndex = parseInt(match[2]);

                    if (site_seeing[sIndex] && site_seeing[sIndex].details[dIndex]) {
                        site_seeing[sIndex].details[dIndex].image = file.path;
                    }
                }
            });
        }

        // **Step 3: Save to Database**
        let saveData = {
            destination_name,
            destination_title,
            mainbanner_text,
            destination_overview,
            description,
            privacy_policy,
            taxes,
            fees,
            cover_image,
            images,
            faqs,
            scene,
            site_seeing
        };

        savedDestination = await Destination.create(saveData);

        // **Step 4: Respond with Success**
        res.status(200).json({
            error: false,
            code: 200,
            message: "Saved Successfully",
            data: savedDestination
        });

    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};











exports.deleteDestination = async (req, res) => {
    console.log("/deleteDestination API called");

    const destinationId = req.body.id; // Get ID from params

    try {
        const deletedDestination = await Destination.findByIdAndDelete(destinationId);
        if (!deletedDestination) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "Destination not found"
            });
        }

        res.status(200).json({
            error: false,
            code: 200,
            message: "Destination deleted successfully",
            data: []
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// exports.editDestination = async (req, res) => {
//     console.log("/editDestination API called");

//     const destinationId = req.body.id; // Get ID from params
//     let data = req.body;

//     try {
//         const destination = await Destination.findById(destinationId);
//         if (!destination) {
//             return res.status(404).json({
//                 error: true,
//                 code: 404,
//                 message: "Destination not found"
//             });
//         }

//         // Update destination fields (non-file related)
//         destination.destination_name = data.destination_name || destination.destination_name;
//         destination.description = data.description || destination.description;
//         destination.privacy_policy = data.privacy_policy || destination.privacy_policy;
//         destination.taxes = data.taxes || destination.taxes;
//         destination.fees = data.fees || destination.fees;
//         destination.faqs = data.faqs ? JSON.parse(data.faqs) : destination.faqs;
//         destination.scene = data.scene || destination.scene;

//         // Handle file updates (cover image and images)
//         if (req.files) {
//             if (req.files.cover_image) {
//                 // Only update if a new cover_image file is provided
//                 destination.cover_image = req.files.cover_image[0].path;
//             }
//             if (req.files.images) {
//                 // Only update if new images are provided
//                 destination.images = req.files.images.map(file => file.path);
//             }
//         }

//         // Save updated destination
//         await destination.save();

//         res.status(200).json({
//             error: false,
//             code: 200,
//             message: "Destination updated successfully",
//             data: destination
//         });
//     } catch (error) {
//         console.error("Catch Error:", error);
//         res.status(400).json({
//             error: true,
//             code: 400,
//             message: "Something went wrong",
//             data: error
//         });
//     }
// };

exports.editDestination = async (req, res) => {
    console.log("/editDestination API called");
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    let data = req.body;
    let destinationId = ObjectId(data.id);

    try {
        if (!destinationId) {
            return res.status(400).json({ error: true, message: "Destination ID is required" });
        }

        let existingDestination = await Destination.findById(destinationId);
        if (!existingDestination) {
            return res.status(404).json({ error: true, message: "Destination not found" });
        }

        let updateData = {
            destination_name: data.destination_name || existingDestination.destination_name,
            destination_title: data.destination_title || existingDestination.destination_title,
            mainbanner_text: data.mainbanner_text || existingDestination.mainbanner_text,
            destination_overview: data.destination_overview || existingDestination.destination_overview,
            description: data.description || existingDestination.description,
            privacy_policy: data.privacy_policy || existingDestination.privacy_policy,
            taxes: data.taxes !== undefined ? data.taxes : existingDestination.taxes,
            fees: data.fees !== undefined ? data.fees : existingDestination.fees,
            scene: data.scene || existingDestination.scene,
            faqs: data.faqs ? JSON.parse(data.faqs) : existingDestination.faqs,
        };

        // **Fix: Extract files manually since `multer.any()` stores them in an array**
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === "cover_image") {
                    updateData.cover_image = file.path;
                } else if (file.fieldname === "images") {
                    // updateData.images = updateData.images || []; //repalce images 
                    updateData.images = existingDestination.images || []; //Retain existing images and push new ones
                    updateData.images.push(file.path);
                }
            });
        }


        // **Fix: Process site_seeing images correctly**
        if (data.site_seeing) {
            let parsedSiteSeeing = JSON.parse(data.site_seeing);
        
            if (Array.isArray(parsedSiteSeeing)) {
                updateData.site_seeing = parsedSiteSeeing.map((item, index) => {
                    return {
                        title: item.title || "",
                        heading: item.heading || "",
                        subheading: item.subheading || "",
                        design: item.design || "",
                        details: Array.isArray(item.details)
                        ? item.details.map((detail, dIndex) => {
                            let matchingImage = req.files.find(file =>
                              file.fieldname.startsWith(`site_seeing[${index}][details][${dIndex}][image]`)
                            );
                      
                            let cleanedImage =
                              typeof detail.image === "string"
                                ? detail.image.replace(/(https?:\/\/[^/]+\/)+/, "")
                                : "";
                      
                            return {
                              title: detail.title || "",
                              description: detail.description || "",
                              image: matchingImage
                                ? matchingImage.path
                                : cleanedImage || (existingDestination.site_seeing[index]?.details[dIndex]?.image || "")
                            };
                          })
                        : []
                      
                    };
                });
            }
        }
        

        let updatedDestination = await Destination.findByIdAndUpdate(destinationId, updateData, { new: true });

        res.status(200).json({
            error: false,
            message: "Updated Successfully",
            data: updatedDestination
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({ error: true, message: "Something went wrong", data: error });
    }
};



exports.viewDestinationById = async (req, res) => {
    console.log("/viewDestinationById API called");

    const destinationId = req.body.id; // Get ID from params

    try {
        const destination = await Destination.findById(destinationId);
        if (!destination) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "Destination not found"
            });
        }

        res.status(200).json({
            error: false,
            code: 200,
            message: "Destination details",
            data: destination
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

exports.getAllDestinations = async (req, res) => {
    console.log("/getAllDestinations API called");
  
    const { search } = req.body; // Get 'search' from body
  
    try {
      const query = {};
  
      if (search) {
        query.destination_name = { $regex: search, $options: "i" }; // Case-insensitive match
      }
  
      const destinations = await Destination.find(query, "_id destination_name cover_image");
  
      res.status(200).json({
        error: false,
        code: 200,
        message: "Filtered destinations",
        data: destinations,
      });
    } catch (error) {
      console.error("Catch Error:", error);
      res.status(400).json({
        error: true,
        code: 400,
        message: "Something went wrong",
        data: error,
      });
    }
  };
  

exports.updateDestinationStatus = async (req, res) => {
    console.log("/updateDestinationStatus API called");

    const destinationId = req.body.id; // Get ID from params
    const status = req.body.status; // Expecting 'active == 1' or 'inactive == 0'

    try {
        const destination = await Destination.findById(destinationId);
        if (!destination) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "Destination not found"
            });
        }

        destination.status = status; // Update the status field
        await destination.save();

        res.status(200).json({
            error: false,
            code: 200,
            message: `Destination status updated to ${status}`,
            data: destination
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

exports.getDestinationsNamesAndIds = async (req, res) => {
    console.log("/getDestinationsNamesAndIds API called");

    try {
        const destinations = await Destination.find({}, 'destination_name _id'); // Fetch only name and id
        res.status(200).json({
            error: false,
            code: 200,
            message: "Destinations names and IDs",
            data: destinations
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

/************************  JourneysInFrame API ************************* */

// Save Itinerary
exports.saveJourneysInFrame = async (req, res) => {
    console.log("/JourneysInFrame API called");

    let data = req.body;
    let savedJourneysInFrame;

    try {
        // Extract values from the request body
        let destination = data.destination || ""; // Should be selected from the dropdown
     
        // Handle file uploads
        let images = req.files?.filter(file => file.fieldname === "images").map(file => file.path) || [];

        // Prepare data for saving
        let saveData = {
            destination,
            images,
        };

        // Save the data to the database
        savedJourneysInFrame = await JourneysInFrame.create(saveData);

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Data saved successfully",
            data: savedJourneysInFrame
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};


// GET /getAllJourneyImages
exports.getAllJourneyImages = async (req, res) => {
    console.log("/getAllJourneyImages API called");

    try {
        // Fetch all active & non-deleted entries
        const frames = await JourneysInFrame.find({
            status: 1,
            is_deleted: 0
        }).select("images");

        // Extract all images into a flat array
        const allImages = frames.flatMap(doc => doc.images);

        res.status(200).json({
            error: false,
            code: 200,
            message: "All images fetched successfully",
            images: allImages
        });
    } catch (error) {
        console.error("Error in getAllJourneyImages:", error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal server error",
            data: error
        });
    }
};

exports.getJourneyByDestinationId = async (req, res) => {
    console.log("/getJourneyByDestinationId API called");

    const { destination } = req.body;

    if (!destination || !mongoose.Types.ObjectId.isValid(destination)) {
        return res.status(400).json({
            error: true,
            code: 400,
            message: "Invalid or missing destination ID",
        });
    }

    try {
        const data = await JourneysInFrame.find({
            destination: destination,
            status: 1,
            is_deleted: 0
        });

        if (data.length === 0) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "No data found for the given destination"
            });
        }

        res.status(200).json({
            error: false,
            code: 200,
            message: "Destination data fetched successfully",
            data
        });
    } catch (error) {
        console.error("Error in getJourneyByDestinationId:", error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Internal server error",
            data: error
        });
    }
};

// DELETE /deleteJourneyById
exports.deleteJourneyById = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await JourneysInFrame.findByIdAndUpdate(id, {
            is_deleted: 1
        });
        res.status(200).json({ code: 200, message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ code: 500, message: "Failed to delete", error: err });
    }
};

exports.deleteSingleJourneyImage = async (req, res) => {
  const { imagePath } = req.body;
  try {
    const update = await JourneysInFrame.updateMany(
      { images: imagePath },
      { $pull: { images: imagePath } }
    );
    res.status(200).json({
      error: false,
      code: 200,
      message: "Image deleted successfully",
      result: update,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: "Error deleting image",
      data: error,
    });
  }
};

/************************  Itinerary API ************************* */

// Save Itinerary
exports.saveItinerary = async (req, res) => {
    console.log("/saveItinerary API called");

    let data = req.body;
    let savedItinerary;

    try {
        // Extract values from the request body
        let itinerary_title = data.itinerary_title || "";
        let destination = data.destination || ""; // Should be selected from the dropdown
        let days_and_night = data.days_and_night || "";
        let internal_days_and_night = data.internal_days_and_night || "";
        let cms_title = data.cms_title || "";
        let current_price = parseFloat(data.current_price) || 0;
        let original_price = parseFloat(data.original_price) || 0;
        let saving = parseFloat(data.saving) || 0;
        let trip_highlights = data.trip_highlights  ? JSON.parse(data.trip_highlights) : [];
        let prerequisites_knowledge = data.prerequisites_knowledge || "";
        let additional_information = data.additional_information || "";
        let destination_name = data.destination_name || "";
        let day_wise_itinerary = data.day_wise_itinerary ? JSON.parse(data.day_wise_itinerary) : [];
        let status = data.status || "inactive"; // Default status
        let inclusions = data.inclusions  ? JSON.parse(data.inclusions) : [];
        let exclusions = data.exclusions  ? JSON.parse(data.exclusions) : [];
        let faqs = data.faqs ? JSON.parse(data.faqs) : [];

        // Handle file uploads
        let cover_image = req.files?.find(file => file.fieldname === "cover_image")?.path || "";
        let images = req.files?.filter(file => file.fieldname === "images").map(file => file.path) || [];

        // Prepare data for saving
        let saveData = {
            itinerary_title,
            destination,
            cover_image,
            days_and_night,
            internal_days_and_night,
            cms_title,
            current_price,
            original_price,
            saving,
            images,
            trip_highlights,
            prerequisites_knowledge,
            additional_information,
            destination_name,
            day_wise_itinerary,
            inclusions,
            exclusions,
            faqs
        };

        // Save the data to the database
        savedItinerary = await Itinerary.create(saveData);

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Itinerary saved successfully",
            data: savedItinerary
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// Delete Itinerary
exports.deleteItinerary = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedItinerary = await Itinerary.findByIdAndDelete(id);

        if (!deletedItinerary) {
            return res.status(404).json({ error: true, message: "Itinerary not found" });
        }

        res.status(200).json({ error: false, message: "Itinerary deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Server error", data: error });
    }
};

// Edit Itinerary
// File: controllers/itineraryController.js

exports.editItinerary = async (req, res) => {
    try {
      const { id } = req.body;
      let data = req.body;
  
      const itinerary = await Itinerary.findById(id);
      if (!itinerary) {
        return res.status(404).json({ error: true, message: "Itinerary not found" });
      }
  
      itinerary.itinerary_title = data.itinerary_title || itinerary.itinerary_title;
      itinerary.cms_title = data.cms_title || itinerary.cms_title;
      itinerary.destination = data.destination || itinerary.destination;
      itinerary.days_and_night = data.days_and_night || itinerary.days_and_night;
      itinerary.internal_days_and_night = data.internal_days_and_night || itinerary.internal_days_and_night;
      itinerary.current_price = parseFloat(data.current_price) || itinerary.current_price;
      itinerary.original_price = parseFloat(data.original_price) || itinerary.original_price;
      itinerary.saving = parseFloat(data.saving) || itinerary.saving;
  
      itinerary.trip_highlights = data.trip_highlights
        ? JSON.parse(data.trip_highlights)
        : itinerary.trip_highlights;
  
      itinerary.prerequisites_knowledge = data.prerequisites_knowledge || itinerary.prerequisites_knowledge;
      itinerary.additional_information = data.additional_information || itinerary.additional_information;
  
      itinerary.day_wise_itinerary = data.day_wise_itinerary
        ? JSON.parse(data.day_wise_itinerary)
        : itinerary.day_wise_itinerary;
  
      itinerary.inclusions = data.inclusions
        ? JSON.parse(data.inclusions)
        : itinerary.inclusions;
  
      itinerary.exclusions = data.exclusions
        ? JSON.parse(data.exclusions)
        : itinerary.exclusions;
  
      itinerary.faqs = data.faqs ? JSON.parse(data.faqs) : itinerary.faqs;
      itinerary.status = data.status || itinerary.status;
  
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            if (file.fieldname === "cover_image") {
                itinerary.cover_image = file.path;
            } else if (file.fieldname === "images") {
                // updateData.images = updateData.images || []; //repalce images 
                itinerary.images = itinerary.images || []; //Retain existing images and push new ones
                itinerary.images.push(file.path);
            }
        });
    }
  
      await itinerary.save();
  
      res.status(200).json({ error: false, message: "Itinerary updated successfully", data: itinerary });
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: true, message: "Server error", data: error });
    }
  };
  

// Get Itinerary by ID
exports.getItineraryById = async (req, res) => {
    try {
        const { id } = req.body;
        const itinerary = await Itinerary.findById(id);

        if (!itinerary) {
            return res.status(404).json({ error: true, message: "Itinerary not found" });
        }

        res.status(200).json({ error: false, data: itinerary });
    } catch (error) {
        res.status(500).json({ error: true, message: "Server error", data: error });
    }
};

// Get Itineraries by Destination
exports.getItinerariesByDestination = async (req, res) => {
    try {
        const { destinationId } = req.body;
        const itineraries = await Itinerary.find(
            { destination: ObjectId(destinationId) },
            "_id itinerary_title cover_image days_and_night status current_price"
        );

        res.status(200).json({ error: false, data: itineraries });
    } catch (error) {
        res.status(500).json({ error: true, message: "Server error", data: error });
    }
};




exports.updateItineraryStatus = async (req, res) => {
    try {
      const { id, status } = req.body;
  
      if (typeof status !== "number" || (status !== 0 && status !== 1)) {
        return res.status(400).json({
          error: true,
          message: "Status must be 0 or 1 (number)",
        });
      }
  
      const itinerary = await Itinerary.findById(id);
  
      if (!itinerary) {
        return res.status(404).json({
          error: true,
          message: "Itinerary not found",
        });
      }
  
      // Toggle status
      const newStatus = status === 1 ? 0 : 1;
  
      itinerary.status = newStatus;
      await itinerary.save();
  
      return res.status(200).json({
        error: false,
        message: `Itinerary status updated to ${newStatus}`,
        data: itinerary,
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({
        error: true,
        message: "Server error",
        data: error,
      });
    }
  };
// Get Name & ID by Destination
exports.getItineraryNamesByDestination = async (req, res) => {
    try {
        const { destinationId } = req.body;
        const itineraries = await Itinerary.find({ destination: ObjectId(destinationId) }).select("_id itinerary_title");

        res.status(200).json({ error: false, data: itineraries });
    } catch (error) {
        res.status(500).json({ error: true, message: "Server error", data: error });
    }
};

// Save Destination With Type
exports.saveDestinationWithType  = async (req, res) => {
    console.log("/saveDestinationWithType API called");

    let { type, destinationId } = req.body;

    try {
        // Validate required fields
        if (!type || !destinationId) {
            return res.status(400).json({
                error: true,
                message: "Type and Destination ID are required"
            });
        }

        let saveData = {
            type,
            destinationId
        };

         // Save the data to the database
         let DestinationWithTypeDta = await DestinationWithType.create(saveData);

        res.status(200).json({
            error: false,
            message: "DestinationWithType saved successfully",
            data: DestinationWithTypeDta
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get Destination With Type
exports.getDestinationWithType = async (req, res) => {
    console.log("/getDestinationWithType API called");

    try {
        let { type } = req.body; // Get type from request body (optional)

        let matchCondition = { is_deleted: 0 };
        if (type) {
            matchCondition.type = type; // Apply filter only if type is provided
        }

        const data = await DestinationWithType.aggregate([
            {
                $match: matchCondition
            },
            {
                $lookup: {
                    from: "destinations", // Collection name in MongoDB
                    localField: "destinationId",
                    foreignField: "_id",
                    as: "destinationDetails"
                }
            },
            {
                $unwind: {
                    path: "$destinationDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    status: 1,
                    "destinationDetails._id": 1,
                    "destinationDetails.destination_name": 1,
                    "destinationDetails.cover_image": 1
                }
            }
        ]);

        res.status(200).json({
            error: false,
            message: "Data retrieved successfully",
            data
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Delete DestinationWithType by ID
exports.deleteDestinationWithType = async (req, res) => {
    console.log("/deleteDestinationWithType API called");

    const { id } = req.body;

    try {
        if (!id) {
            return res.status(400).json({
                error: true,
                message: "ID is required"
            });
        }

        // Optional: perform soft delete
        const deleted = await DestinationWithType.findByIdAndUpdate(
            id,
            { is_deleted: 1 },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({
                error: true,
                message: "DestinationWithType not found"
            });
        }

        return res.status(200).json({
            error: false,
            message: "DestinationWithType deleted successfully",
            data: deleted
        });

    } catch (error) {
        console.error("Catch Error:", error);
        return res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Save Itineraries With Type
exports.saveItinerariesWithType = async (req, res) => {
    console.log("/saveItinerariesWithType API called");

    let { type, itineraryId ,destination_id} = req.body;

    try {
        // Validate required fields
        if (!type || !itineraryId) {
            return res.status(400).json({
                error: true,
                message: "Type and Itinerary ID are required"
            });
        }

        let saveData = {
            type,
            itineraryId,
            destination_id
        };

        // Save the data to the database
        let itinerariesWithTypeData = await ItinerariesWithType.create(saveData);

        res.status(200).json({
            error: false,
            message: "ItinerariesWithType saved successfully",
            data: itinerariesWithTypeData
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get Itineraries With Type
// controllers/itineraryController.js

exports.getItinerariesWithType = async (req, res) => {
    console.log("/getItinerariesWithType API called");

    try {
        const { type, destination_id } = req.body;

        const matchCondition = { is_deleted: 0 };
        if (type) matchCondition.type = type;
        if (destination_id) matchCondition.destination_id = ObjectId(destination_id);

        const data = await ItinerariesWithType.aggregate([
            { $match: matchCondition },
            {
                $lookup: {
                    from: "itineraries",
                    localField: "itineraryId",
                    foreignField: "_id",
                    as: "itineraryDetails"
                }
            },
            {
                $unwind: {
                    path: "$itineraryDetails",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $match: {
                    "itineraryDetails.status": 1
                }
            },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    status: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "itineraryDetails._id": 1,
                    "itineraryDetails.itinerary_title": 1,
                    "itineraryDetails.cms_title": 1,
                    "itineraryDetails.cover_image": 1,
                    "itineraryDetails.current_price": 1,
                    "itineraryDetails.original_price": 1,
                    "itineraryDetails.saving": 1,
                    "itineraryDetails.days_and_night": 1,
                    "itineraryDetails.internal_days_and_night": 1,
                    "itineraryDetails.destination_overview": 1,
                    "itineraryDetails.mainbanner_text": 1,
                    "itineraryDetails.status": 1,
                    "itineraryDetails.additional_information": 1,
                }
            }
        ]);

        res.status(200).json({
            error: false,
            message: "Data retrieved successfully",
            data
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Delete ItinerariesWithType by ID
exports.deleteItinerariesWithType = async (req, res) => {
    console.log("/deleteItinerariesWithType API called");

    const { id } = req.body;

    try {
        if (!id) {
            return res.status(400).json({
                error: true,
                message: "ID is required"
            });
        }

        const deleted = await ItinerariesWithType.findByIdAndUpdate(
            id,
            { is_deleted: 1 },
            { new: true }
        );

        if (!deleted) {
            return res.status(404).json({
                error: true,
                message: "ItinerariesWithType record not found"
            });
        }

        return res.status(200).json({
            error: false,
            message: "ItinerariesWithType deleted successfully",
            data: deleted
        });
    } catch (error) {
        console.error("Catch Error:", error);
        return res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};


// Save Holiday Theme
exports.saveHolidayTheme = async (req, res) => {
    console.log("/saveHolidayTheme API called");

    let data = req.body;
    let savedTheme;

    try {
        // Extract values from the request body
        let title = data.title || "";
        let description = data.description || "";

        // Handle uploaded files
        let images = req.files?.images ? req.files.images.map(file => file.path) : [];

        // Prepare data for saving
        let saveData = {
            title,
            description,
            images
        };

        // Save the data to the database
        savedTheme = await HolidaysByTheme.create(saveData);

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Holiday Theme Saved Successfully",
            data: savedTheme
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

//   sasd Updates    Holiday Theme
exports.updateHolidayTheme = async (req, res) => {
    console.log("/updateHolidayTheme API called");

    let { id } = req.body;
    let data = req.body;
    let updatedTheme;

    try {
        // Extract values from the request body
        let title = data.title || "";
        let description = data.description || "";

       

        // Handle multiple images update
        let images = [];
        if (req.files?.images) {
            images = req.files.images.map(file => file.path);  // Update multiple images if provided
        }

        // Prepare the data to update
        const updateData = {
            title,
            description,
            ...(images.length > 0 && { images })  // Only update images if any are provided
        };

        // Find and update the holiday theme
        updatedTheme = await HolidaysByTheme.findOneAndUpdate(
            { _id: ObjectId(id), is_deleted: 0 },  // Only update if the theme exists and is not deleted
            updateData,
            { new: true }
        );

        // Check if the theme was found and updated
        if (!updatedTheme) {
            return res.status(404).json({ error: true, message: "Holiday Theme not found" });
        }

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Holiday Theme Updated Successfully",
            data: updatedTheme
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// 
exports.softDeleteHolidayTheme = async (req, res) => {
    console.log("/deleteHolidayTheme API called");

    let { id } = req.body;

    try {
        let deletedTheme = await HolidaysByTheme.findOneAndUpdate(
            { _id: id, is_deleted: 0 },
            { is_deleted: 1 },
            { new: true }
        );

        if (!deletedTheme) {
            return res.status(404).json({ error: true, message: "Holiday Theme not found" });
        }

        res.status(200).json({
            error: false,
            message: "Holiday Theme deleted successfully"
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({ error: true, message: "Something went wrong", data: error });
    }
};

exports.hardDeleteHolidayTheme = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedTheme = await HolidaysByTheme.findByIdAndDelete(id);

        if (!deletedTheme) {
            return res.status(404).json({ error: true, message: "Holiday Theme not found" });
        }

        res.status(200).json({ error: false, message: "Holiday Theme deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Server error", data: error });
    }
};

exports.getAllHolidayThemes = async (req, res) => {
    console.log("/getAllHolidayThemes API called");

    try {
        let themes = await HolidaysByTheme.find({ is_deleted: 0 });

        res.status(200).json({
            error: false,
            message: "All holiday themes retrieved successfully",
            data: themes
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({ error: true, message: "Something went wrong", data: error });
    }
};

exports.getHolidayThemeById = async (req, res) => {
    console.log("/getHolidayThemeById API called");

    let { id } = req.body;

    try {
        let theme = await HolidaysByTheme.findOne({ _id: id, is_deleted: 0 });

        if (!theme) {
            return res.status(404).json({ error: true, message: "Holiday Theme not found" });
        }

        res.status(200).json({
            error: false,
            message: "Holiday Theme retrieved successfully",
            data: theme
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({ error: true, message: "Something went wrong", data: error });
    }
};

exports.updateHolidayThemeStatus = async (req, res) => {
    console.log("/updateHolidayThemeStatus API called");

    let { id } = req.body;
    let { status } = req.body;

    try {
        if (status !== 0 && status !== 1) {
            return res.status(400).json({ error: true, message: "Invalid status value" });
        }

        let updatedStatus = await HolidaysByTheme.findOneAndUpdate(
            { _id: id, is_deleted: 0 },
            { status },
            { new: true }
        );

        if (!updatedStatus) {
            return res.status(404).json({ error: true, message: "Holiday Theme not found" });
        }

        res.status(200).json({
            error: false,
            message: "Holiday Theme status updated successfully",
            data: updatedStatus
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({ error: true, message: "Something went wrong", data: error });
    }
};


// Save Testimonial API
exports.saveTestimonial = async (req, res) => {
    console.log("/saveTestimonial API called");

    let data = req.body;
    let savedTestimonial;

    try {
        // Extract values from the request body
        let name = data.name || "";
        let description = data.description || "";
        let rating = data.rating || 0;

        // Handle uploaded files (images array)
        // let image = req.files?.image ? req.files.image[0].path : "";

        let images = req.files?.images ? req.files.images.map(file => file.path) : [];


        // Prepare data for saving
        let saveData = {
            name,
            description,
            images,
            rating
        };

        // Save the data to the database
        savedTestimonial = await Testimonial.create(saveData);

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Testimonial Saved Successfully",
            data: savedTestimonial
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// Edit Testimonial API
exports.updateTestimonial = async (req, res) => {
    console.log("/updateTestimonial API called");

    let { id } = req.body;
    let data = req.body;

    try {
        // Extract values from the request body
        let name = data.name || "";
        let description = data.description || "";
        let rating = data.rating || 0;

        // Handle uploaded files (images array)
        let images = req.files?.images ? req.files.images.map(file => file.path) : [];

        // Prepare the data to be updated
        let updateData = {
            name,
            description,
            rating,
            ...(images && { images }) // Only update image if provided
        };

        // Find and update the testimonial
        let updatedTestimonial = await Testimonial.findOneAndUpdate(
            { _id: id, is_deleted: 0 },
            updateData,
            { new: true }
        );

        if (!updatedTestimonial) {
            return res.status(404).json({ error: true, message: "Testimonial not found" });
        }

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Testimonial Updated Successfully",
            data: updatedTestimonial
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get All Testimonials API
exports.getAllTestimonials = async (req, res) => {
    console.log("/getAllTestimonials API called");

    try {
        let testimonials = await Testimonial.find({ is_deleted: 0 });

        res.status(200).json({
            error: false,
            message: "Testimonials retrieved successfully",
            data: testimonials
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get Testimonial by ID API
exports.getTestimonialById = async (req, res) => {
    console.log("/getTestimonialById API called");

    let { id } = req.body;

    try {
        let testimonial = await Testimonial.findOne({ _id: id, is_deleted: 0 });

        if (!testimonial) {
            return res.status(404).json({ error: true, message: "Testimonial not found" });
        }

        res.status(200).json({
            error: false,
            message: "Testimonial retrieved successfully",
            data: testimonial
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Update Status (Active/Inactive) API
exports.updateTestimonialStatus = async (req, res) => {
    console.log("/updateTestimonialStatus API called");

    let { id, status } = req.body; // Expecting status to be 1 (active) or 0 (inactive)

    try {
        let updatedTestimonial = await Testimonial.findOneAndUpdate(
            { _id: id, is_deleted: 0 },
            { status },
            { new: true }
        );

        if (!updatedTestimonial) {
            return res.status(404).json({ error: true, message: "Testimonial not found" });
        }

        res.status(200).json({
            error: false,
            message: "Testimonial status updated successfully",
            data: updatedTestimonial
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Hard Delete Testimonial API
exports.deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.body;
        const deletedTestimonial = await Testimonial.findByIdAndDelete(id);

        if (!deletedTestimonial) {
            return res.status(404).json({ error: true, message: "Testimonial not found" });
        }

        res.status(200).json({ error: false, message: "Testimonial deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: "Server error", data: error });
    }
};

// Add New Partner API
exports.addPartner = async (req, res) => {
    console.log("/addPartner API called");

    let data = req.body;

    try {
        // Extract data from the request body
        let name = data.name || "";
        let images = req.files?.images ? req.files.images.map(file => file.path) : [];

        // Prepare data for saving
        let saveData = {
            name,
            images,
            status: 'active' // default status
        };

        // Save the partner to the database
        let savedPartner = await Partner.create(saveData);

        res.status(200).json({
            error: false,
            message: "Partner added successfully",
            data: savedPartner
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Hard Delete Partner API
exports.deletePartner = async (req, res) => {
    console.log("/deletePartner API called");

    let { id } = req.body;

    try {
        // Perform a hard delete by partner ID
        let deletedPartner = await Partner.findOneAndDelete({ _id: id });

        if (!deletedPartner) {
            return res.status(404).json({ error: true, message: "Partner not found" });
        }

        res.status(200).json({
            error: false,
            message: "Partner deleted successfully"
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get All Partners API
exports.getAllPartners = async (req, res) => {
    console.log("/getAllPartners API called");

    try {
        // Fetch all partners from the database
        const partners = await Partner.find({ is_deleted: 0 });

        res.status(200).json({
            error: false,
            message: "Partners fetched successfully",
            data: partners
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Update Partner Status API (Active/Inactive)
exports.updatePartnerStatus = async (req, res) => {
    console.log("/updatePartnerStatus API called");

    let { id, status } = req.body;

    try {
        // Validate status (must be 'active' or 'inactive')
        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ error: true, message: "Invalid status" });
        }

        // Update the partner's status
        let updatedPartner = await Partner.findOneAndUpdate(
            { _id: id },
            { status },
            { new: true }
        );

        if (!updatedPartner) {
            return res.status(404).json({ error: true, message: "Partner not found" });
        }

        res.status(200).json({
            error: false,
            message: "Partner status updated successfully",
            data: updatedPartner
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get Partner by ID
exports.getPartnerById = async (req, res) => {
    console.log("/getPartnerById API called");

    let { id } = req.body; // Retrieve the partner ID from URL parameters

    try {
        // Find the partner by ID and ensure it's not deleted
        let partner = await Partner.findOne({ _id: id, is_deleted: false });

        // If no partner is found, return a 404 error
        if (!partner) {
            return res.status(404).json({
                error: true,
                message: "Partner not found"
            });
        }

        // Respond with the partner data
        res.status(200).json({
            error: false,
            message: "Partner retrieved successfully",
            data: partner
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Update Partner by ID
exports.updatePartner = async (req, res) => {
    console.log("/updatePartner API called");

    let { id } = req.body; // Get the partner ID from the URL parameter
    let data = req.body; // Get the request body with the updated data

    try {
        // Extract fields from the request body
        let name = data.name || "";
        let images = req.files?.images ? req.files.images.map(file => file.path) : [];

        // Prepare the update data
        let updateData = {
            name,
            images
        };

        // Find the partner by ID and update it
        let updatedPartner = await Partner.findByIdAndUpdate(id, updateData, { new: true });

        // Check if the partner was not found
        if (!updatedPartner) {
            return res.status(404).json({
                error: true,
                message: "Partner not found"
            });
        }

        // Respond with success and the updated partner data
        res.status(200).json({
            error: false,
            message: "Partner updated successfully",
            data: updatedPartner
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Create Vendor
exports.saveVendor = async (req, res) => {
    console.log("/saveVendor API called");

    let data = req.body;
    let savedVendor;

    try {
        // Extract values from the request body
        let name = data.name || "";
        let email = data.email || "";
        let mobile = data.mobile || "";
        let destination = data.destination || "";

        // Handle uploaded files
        let images = req.files?.images ? req.files.images.map(file => file.path) : [];

        // Prepare data for saving
        let saveData = {
            name,
            email,
            mobile,
            destination,
            images
        };

        // Save the data to the database
        savedVendor = await Vendor.create(saveData);

        res.status(200).json({
            error: false,
            message: "Vendor Saved Successfully",
            data: savedVendor
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get All Vendors
exports.getAllVendors = async (req, res) => {
    console.log("/getAllVendors API called");

    try {
        const vendors = await Vendor.find({ is_deleted: false }).populate("destination");

        res.status(200).json({
            error: false,
            message: "Vendors retrieved successfully",
            data: vendors
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get Vendor By ID
exports.getVendorById = async (req, res) => {
    console.log("/getVendorById API called");

    let { id } = req.body;

    try {
        const vendor = await Vendor.findById(id).populate("destination");

        if (!vendor) {
            return res.status(404).json({
                error: true,
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Vendor retrieved successfully",
            data: vendor
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Update Vendor by ID
exports.updateVendor = async (req, res) => {
    console.log("/updateVendor API called");

    let { id } = req.body;
    let data = req.body;

    try {
        // Extract fields from the request body
        let name = data.name || "";
        let email = data.email || "";
        let mobile = data.mobile || "";
        let destination = data.destination || "";

        // Handle file updates (images)
        let images = req.files?.images ? req.files.images.map(file => file.path) : [];

        // Prepare update data
        let updateData = {
            name,
            email,
            mobile,
            destination,
            images
        };

        // Find and update the vendor
        let updatedVendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedVendor) {
            return res.status(404).json({
                error: true,
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Vendor updated successfully",
            data: updatedVendor
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Hard Delete Vendor
exports.deleteVendor = async (req, res) => {
    console.log("/deleteVendor API called");

    let { id } = req.body;

    try {
        let deletedVendor = await Vendor.findByIdAndDelete(id);

        if (!deletedVendor) {
            return res.status(404).json({
                error: true,
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Vendor deleted successfully"
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Update Vendor Status (Active/Inactive)
exports.updateVendorStatus = async (req, res) => {
    console.log("/updateVendorStatus API called");

    let { id, status } = req.body;

    try {
        // Validate status
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                error: true,
                message: "Invalid status. Must be 'active' or 'inactive'"
            });
        }

        let updatedVendor = await Vendor.findByIdAndUpdate(id, { status }, { new: true });

        if (!updatedVendor) {
            return res.status(404).json({
                error: true,
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            error: false,
            message: `Vendor status updated to ${status} successfully`,
            data: updatedVendor
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

//Create Lead
exports.createLead = async (req, res) => {
    console.log("/createLead API called");
  
    const data = req.body;
    let savedLead;
  
    try {
      const {
        name = "",
        phone_number = "",
        email = "",
        message = "",
        lead_status = "new",
        priority = "medium",
        destination_id = null,
        itinerary_id = null,
        destination_details = "",
        itinerary_details = ""
      } = data;
  
      let lead_type = "general";
      let destination_name = "";
      let itinerary_title = "";
  
      // Check for destination
      if (destination_id && ObjectId.isValid(destination_id)) {
        const destination = await Destination.findOne({ _id: destination_id, is_deleted: 0 });
  
        if (destination) {
          lead_type = "destination";
          destination_name = destination.destination_name;
        }
      }
  
      // Check for itinerary only if destination not matched
      if (
        lead_type === "general" &&
        itinerary_id &&
        ObjectId.isValid(itinerary_id)
      ) {
        const itinerary = await Itinerary.findOne({ _id: itinerary_id, is_deleted: 0 });
  
        if (itinerary) {
          lead_type = "itinerary";
          itinerary_title = itinerary.itinerary_title;
        }
      }
  
      const saveData = {
        name,
        phone_number,
        email,
        message,
        lead_type,
        lead_status,
        priority,
        destination_details,
        itinerary_details,
        ...(destination_name && { destination_name }),
        ...(itinerary_title && { itinerary_title }),
      };
  
      savedLead = await Lead.create(saveData);
  
      res.status(200).json({
        error: false,
        message: "Lead Created Successfully",
        data: savedLead
      });
  
    } catch (error) {
      console.error("Catch Error:", error);
      res.status(400).json({
        error: true,
        message: "Something went wrong",
        data: error
      });
    }
  };


exports.getAllLeads = async (req, res) => {
    console.log("/getAllLeads API called");

    try {
       

        const { lead_type, page = 1, limit = 10, assigned_to } = req.body;
        const filter = {};
        if (lead_type) filter.lead_type = lead_type.toLowerCase();
        if (assigned_to) filter.assigned_to = assigned_to;
        

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [leads, total] = await Promise.all([
            Lead.find(filter)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Lead.countDocuments(filter)
        ]);

        res.status(200).json({
            error: false,
            message: "Leads retrieved successfully",
            data: leads,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};



// Get Leads By Type
exports.getLeadsByType = async (req, res) => {
    console.log("/getLeadsByType API called");

    let { type } = req.body;

    try {
        const leads = await Lead.find({ lead_type: type }).sort({ created_at: -1 });

        if (leads.length === 0) {
            return res.status(404).json({
                error: true,
                message: `No leads found for type: ${type}`
            });
        }

        res.status(200).json({
            error: false,
            message: "Leads retrieved successfully",
            data: leads
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Update Lead by ID
exports.updateLead = async (req, res) => {
    console.log("/updateLead API called");

    let { id } = req.body;
    let data = req.body;

    try {
        // Extract fields from the request body
        let name = data.name || "";
        let phone_number = data.phone_number || "";
        let email = data.email || "";
        let message = data.message || "";
        let lead_type = data.lead_type || "";
        let lead_status = data.lead_status || "new";
        let priority = data.priority || "medium";
        let destination_details = data.lead_type === "destination" ? data.destination_details : "";
        let itinerary_details = data.lead_type === "itinerary" ? data.itinerary_details : "";

        // Prepare update data
        let updateData = {
            name,
            phone_number,
            email,
            message,
            lead_type,
            lead_status,
            priority,
            destination_details,
            itinerary_details,
            updated_at: Date.now()
        };

        // Find and update the lead
        let updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedLead) {
            return res.status(404).json({
                error: true,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Lead updated successfully",
            data: updatedLead
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Hard Delete Lead
exports.deleteLead = async (req, res) => {
    console.log("/deleteLead API called");

    let { id } = req.body;

    try {
        let deletedLead = await Lead.findByIdAndDelete(id);

        if (!deletedLead) {
            return res.status(404).json({
                error: true,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Lead deleted successfully"
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

exports.updateLeadStatus = async (req, res) => {
    console.log("/updateLeadStatus API called");
  
    const { lead_id, new_status, updated_by_id, updated_by_name } = req.body;
  
    if (!lead_id || !new_status || !updated_by_id || !updated_by_name) {
      return res.status(400).json({
        error: true,
        message: "Missing required fields: lead_id, new_status, updated_by_id, updated_by_name"
      });
    }
  
    try {
      const lead = await Lead.findById(lead_id);
      if (!lead) {
        return res.status(404).json({ error: true, message: "Lead not found" });
      }
  
      lead.lead_status = new_status;
      lead.updatedBy = {
        id: updated_by_id,
        name: updated_by_name
      };
      await lead.save();
  
      return res.status(200).json({
        error: false,
        message: "Lead status updated successfully",
        data: lead
      });
    } catch (error) {
      console.error("updateLeadStatus error:", error);
      return res.status(500).json({
        error: true,
        message: "Internal server error",
        data: error
      });
    }
  };
  
// Create Agent
exports.createAgent = async (req, res) => {
    console.log("/createAgent API called");

    let data = req.body;
    let savedAgent;

    if (!data.password || data.password.length < 6) {
        return res.status(400).json({ error: true, message: "Password must be at least 6 characters" });
      }
      

    try {
        // Extract values from the request body
        let name = data.name || "";
        let email = data.email || "";
        let password = await bcrypt.hash(data.password || "", 10);
        let user_role =data.user_role || " ";
        let number = data.number || "";
        let secondary_number = data.secondary_number || "";
        let salary = data.salary || 0;
        let gender = data.gender || "";
        let education_status = data.education_status || "";
        let DOB = data.DOB || "";
        let skills = data.skills || '';
        let designation = data.designation || "";
        // let profile_photo = data.profile_photo || "";
        let profile_photo = req.files?.find(file => file.fieldname === "profile_photo")?.path || "";
        // Prepare data for saving
        let saveData = {
            name,
            email,
            password,
            number,
            user_role,
            secondary_number,
            salary,
            gender,
            education_status,
            DOB,
            skills,
            designation,
            profile_photo
        };

        // Save the data to the database
        savedAgent = await Agent.create(saveData);

        res.status(200).json({
            error: false,
            message: "Agent Created Successfully",
            data: savedAgent
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get All Agents
exports.getAllAgents = async (req, res) => {
    console.log("/getAllAgents API called");

    try {
        const agents = await Agent.find({}).sort({ created_at: -1 });

        res.status(200).json({
            error: false,
            message: "Agents retrieved successfully",
            data: agents
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Get Agent by ID
exports.getAgentById = async (req, res) => {
    console.log("/getAgentById API called");

    let { id } = req.body;

    try {
        const agent = await Agent.findById(id);

        if (!agent) {
            return res.status(404).json({
                error: true,
                message: "Agent not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Agent retrieved successfully",
            data: agent
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Update Agent by ID
exports.updateAgent = async (req, res) => {
    console.log("/updateAgent API called");

    let { id } = req.body;
    let data = req.body;

    try {
        // Prepare update data
        let updateData = {
            name: data.name || "",
            email: data.email || "",
            number: data.number || "",
            password:data.password ||"admin@123",
            secondary_number: data.secondary_number || "",
            salary: data.salary || 0,
            gender: data.gender || "",
            education_status: data.education_status || "",
            DOB: data.DOB || "",
            skills: data.skills || [],
            designation: data.designation || "",
            updated_at: Date.now()
        };
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                if (file.fieldname === "profile_photo") {
                    updateData.profile_photo = file.path;
                } 
            });
        }
        // Find and update the agent
        let updatedAgent = await Agent.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedAgent) {
            return res.status(404).json({
                error: true,
                message: "Agent not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Agent updated successfully",
            data: updatedAgent
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Delete Agent
exports.deleteAgent = async (req, res) => {
    console.log("/deleteAgent API called");

    let { id } = req.body;

    try {
        let deletedAgent = await Agent.findByIdAndDelete(id);

        if (!deletedAgent) {
            return res.status(404).json({
                error: true,
                message: "Agent not found"
            });
        }

        res.status(200).json({
            error: false,
            message: "Agent deleted successfully"
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

exports.loginAgent = async (req, res) => {
    console.log("/loginAgent API called");
  
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password are required"
      });
    }
  
    try {
      const agent = await Agent.findOne({ email });
  
      if (!agent) {
        return res.status(404).json({
          error: true,
          message: "Agent not found"
        });
      }
  
      const isMatch = await bcrypt.compare(password, agent.password);
  
      if (!isMatch) {
        return res.status(401).json({
          error: true,
          message: "Invalid password"
        });
      }
  
      // Generate JWT Token
      const token = jwt.sign(
        { id: agent._id, email: agent.email, role: agent.user_role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );
  
      res.status(200).json({
        error: false,
        message: "Login successful",
        token,
        user: {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          role: agent.user_role
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({
        error: true,
        message: "Something went wrong",
      });
    }
  };

//    assign Lead TO Agnet

  exports.assignLead = async (req, res) => {
    console.log("/assignLead API called");
    const { lead_id, agent_id, super_agent_id } = req.body;
  
    if (!lead_id || !agent_id || !super_agent_id) {
      return res.status(400).json({ error: true, message: "Missing required fields" });
    }
  
    try {
      const updated = await Lead.findByIdAndUpdate(lead_id, {
        assigned_to: agent_id,
        assigned_by: super_agent_id,
        assignment_date: new Date()
      }, { new: true });
  
      if (!updated) {
        return res.status(404).json({ error: true, message: "Lead not found" });
      }
  
      res.status(200).json({
        error: false,
        message: "Lead assigned successfully",
        data: updated
      });
    } catch (err) {
      console.error("Error in assignLead:", err);
      res.status(500).json({ error: true, message: "Something went wrong", data: err });
    }
  };
  









/************************ Get Image Type Schenario ********************** */
exports.getSchenarioImageType = (req, res) => {
    console.log("/getSchenarioImageType")
    scenario_details.find({type:"image"})
        .then((data) => {
            res.status(201).json({
                error: false,
                code: 201,
                message: "Scenario Fetched Successfully",
                data: data
            });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({
                error: true,
                code: 500,
                message: "Internal Server Error",
                data: error.message
            });
        });
};


exports.deleteImage = async (req, res) => {
    console.log("/deleteImage API called");

    const { destinationId, imagePath } = req.body;

    try {
        if (!destinationId || !imagePath) {
            return res.status(400).json({ error: true, message: "Destination ID and Image Path are required" });
        }

        const destination = await Destination.findById(destinationId);

        if (!destination) {
            return res.status(404).json({ error: true, message: "Destination not found" });
        }

        // Normalize paths for comparison
        const normalizedImagePath = imagePath.replace(/\\/g, "/");
        const normalizedDBPaths = destination.images.map(img => img.replace(/\\/g, "/"));

        if (!normalizedDBPaths.includes(normalizedImagePath)) {
            return res.status(400).json({ error: true, message: "Image not found in destination" });
        }

        const filePath = path.join(__dirname, "..", "uploads", path.basename(imagePath));
        console.log(filePath, "Final File Path");

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } else {
            console.log(`File not found: ${filePath}`);
        }

        const updatedDestination = await Destination.findByIdAndUpdate(
            destinationId,
            { $pull: { images: { $in: [imagePath, normalizedImagePath] } } },
            { new: true }
        );

        res.status(200).json({
            error: false,
            message: "Image deleted successfully",
            data: updatedDestination
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: true, message: "Something went wrong", data: error });
    }
};

exports.deleteItineraryImage = async (req, res) => {
   

    const { itineraryId, imagePath } = req.body;

    try {
        if (!itineraryId || !imagePath) {
            return res.status(400).json({ error: true, message: "Itinerary ID and Image Path are required" });
        }

        const itinerary = await Itinerary.findById(itineraryId);

        if (!itinerary) {
            return res.status(404).json({ error: true, message: "Itinerary not found" });
        }

        // Normalize paths for comparison
        const normalizedImagePath = imagePath.replace(/\\/g, "/");
        const normalizedDBPaths = itinerary.images.map(img => img.replace(/\\/g, "/"));

        if (!normalizedDBPaths.includes(normalizedImagePath)) {
            return res.status(400).json({ error: true, message: "Image not found in Itinerary" });
        }

        const filePath = path.join(__dirname, "..", "uploads", path.basename(imagePath));
        console.log(filePath, "Final File Path");

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } else {
            console.log(`File not found: ${filePath}`);
        }

        const updatedItinerary = await Itinerary.findByIdAndUpdate(
            itineraryId,
            { $pull: { images: { $in: [imagePath, normalizedImagePath] } } },
            { new: true }
        );

        res.status(200).json({
            error: false,
            message: "Image deleted successfully",
            data: updatedItinerary
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: true, message: "Something went wrong", data: error });
    }
};

// Save Testimonial API
exports.saveTerms = async (req, res) => {
    console.log("/saveTerms API called");

    let data = req.body;
    let savedTerms;

    try {
        // Extract values from the request body
        let terms_conditions = data.terms_conditions || "";
        

     

       // Prepare data for saving
        let saveData = {
            terms_conditions,
            
        };

        // Save the data to the database
        savedTerms = await Terms.create(saveData);

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Terms Saved Successfully",
            data: savedTerms
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// Edit Terms API
exports.updateTerms = async (req, res) => {
    console.log("/updateTerms API called");

    const { id, terms_conditions } = req.body;
console.log("Request Body:", req.body);

    if (!id) {
        return res.status(400).json({
            error: true,
            code: 400,
            message: "Missing 'id' in request body",
            data: null
        });
    }

    try {
        const updateFields = {};
        if (typeof terms_conditions === 'string') updateFields.terms_conditions = terms_conditions;
        updateFields.updated_at = new Date();

        const updatedTerms = await Terms.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedTerms) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "Terms not found",
                data: null
            });
        }

        res.status(200).json({
            error: false,
            code: 200,
            message: "Terms updated successfully",
            data: updatedTerms
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Server error during update",
            data: error
        });
    }
};


// Get Terms by ID API
exports.getTermsById = async (req, res) => {
    console.log("/getTermsById API called");

    let { id } = req.body;

    try {
        let terms = await Terms.findOne({ _id: id, });

        if (!terms) {
            return res.status(404).json({ error: true, message: "Terms not found" });
        }

        res.status(200).json({
            error: false,
            message: "Terms retrieved successfully",
            data: terms
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

// Save Terms API
exports.savePrivacy = async (req, res) => {
    console.log("/savePrivacy API called");

    let data = req.body;
    let savedPrivacy;

    try {
        // Extract values from the request body
        let privacy_policy = data.privacy_policy || "";
        

     

       // Prepare data for saving
        let saveData = {
            privacy_policy,
            
        };

        // Save the data to the database
        savedPrivacy = await Privacy.create(saveData);

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Privacy Policy Saved Successfully",
            data: savedPrivacy
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// Edit Terms API
exports.updatePrivacy = async (req, res) => {
    console.log("/updatePrivacy API called");

    const { id, privacy_policy } = req.body;
console.log("Request Body:", req.body);

    if (!id) {
        return res.status(400).json({
            error: true,
            code: 400,
            message: "Missing 'id' in request body",
            data: null
        });
    }

    try {
        const updateFields = {};
        if (typeof privacy_policy === 'string') updateFields.privacy_policy = privacy_policy;
        updateFields.updated_at = new Date();

        const updatedPrivacy = await Privacy.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedPrivacy) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "Privacy not found",
                data: null
            });
        }

        res.status(200).json({
            error: false,
            code: 200,
            message: "Privacy updated successfully",
            data: updatedPrivacy
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Server error during update",
            data: error
        });
    }
};


// Get Terms by ID API
exports.getPrivacyById = async (req, res) => {
    console.log("/getPrivacyById API called");

    let { id } = req.body;

    try {
        let privacy = await Privacy.findOne({ _id: id, });

        if (!privacy) {
            return res.status(404).json({ error: true, message: "Privacy not found" });
        }

        res.status(200).json({
            error: false,
            message: "Privacy retrieved successfully",
            data: privacy
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};


// Save Copyright API
exports.saveCopyright = async (req, res) => {
    console.log("/saveCopyright API called");

    let data = req.body;
    let savedCopyright;

    try {
        // Extract values from the request body
        let copyright_policy = data.copyright_policy || "";
        

     

       // Prepare data for saving
        let saveData = {
            copyright_policy,
            
        };

        // Save the data to the database
        savedCopyright = await Copyright.create(saveData);

        // Respond with success
        res.status(200).json({
            error: false,
            code: 200,
            message: "Copy Right Policy Saved Successfully",
            data: savedCopyright
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(400).json({
            error: true,
            code: 400,
            message: "Something went wrong",
            data: error
        });
    }
};

// Edit Copy Right  API
exports.updateCopyright = async (req, res) => {
    console.log("/updateCopyright API called");

    const { id, copyright_policy } = req.body;
console.log("Request Body:", req.body);

    if (!id) {
        return res.status(400).json({
            error: true,
            code: 400,
            message: "Missing 'id' in request body",
            data: null
        });
    }

    try {
        const updateFields = {};
        if (typeof copyright_policy === 'string') updateFields.copyright_policy = copyright_policy;
        updateFields.updated_at = new Date();

        const updatedCopyright = await Copyright.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedCopyright) {
            return res.status(404).json({
                error: true,
                code: 404,
                message: "Copy Right not found",
                data: null
            });
        }

        res.status(200).json({
            error: false,
            code: 200,
            message: "Copy Right updated successfully",
            data: updatedCopyright
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            code: 500,
            message: "Server error during update",
            data: error
        });
    }
};


// Get Copy Right by ID API
exports.getCopyrightById = async (req, res) => {
    console.log("/getCopyrightById API called");

    let { id } = req.body;

    try {
        let copyright = await Copyright.findOne({ _id: id, });

        if (!copyright) {
            return res.status(404).json({ error: true, message: "Copy Right not found" });
        }

        res.status(200).json({
            error: false,
            message: "Copy Right retrieved successfully",
            data: copyright
        });
    } catch (error) {
        console.error("Catch Error:", error);
        res.status(500).json({
            error: true,
            message: "Something went wrong",
            data: error
        });
    }
};

/************************ Delete Qestions and Options bye Scene Id of KMS **************** */
// exports.deleteSceine = async (req, res) => {
    //          console.log("http://localhost:2222/deleteSceine")
    
    //     let id = req.body.id
    //     // const deleteData = await Question.deleteMany({scene:id})
    //     if (deleteData) {
    //         res.status(201).send(deleteData);
    //     }
// };
