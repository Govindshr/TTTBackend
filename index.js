
const mongoose = require("mongoose");
const express = require("express");
const fs = require('fs')
const jwt = require('jsonwebtoken');
const multer = require("multer");
var bcrypt = require('bcryptjs');
var randomstring = require('randomstring');
const bodyParser = require('body-parser');
var moment = require('moment');
const path = require('path');
const https = require('https');



const ObjectId = require('mongoose').Types.ObjectId;
const cors = require("cors");
const controller = require('./api.contrroller')
const handler = require('./api.handler')

// var validator = require('gstin-validator');


require("./db/config");

const { Question, scenario_details, Registration, logs,Email_otp } = require("./db/schema")


const app = express();
app.use(express.json());
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Serve 'uploads' directory

app.get('/', (req, res) => {
    res.send("Home Page Of KMS");
})
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen((2001), () => {
    console.log("app is running on port 2001")
})

// let server;
// const options = {
//     key: fs.readFileSync(path.join(`./SSL/kms.qdegrees.pem`)),//ssl.key
    
//     cert: fs.readFileSync(path.join(`./SSL/kms.qdegrees.crt`))  //ssl.cert
//     };
//     console.log(options);

//     server = https.createServer(options, app);

// app.get('/', (req, res) => {
//     res.send("Home Page Of KMS");
// })

// server.listen((3006), () => {
//     console.info(`Express server listening on PORT: 3006`)
// });

//====================================== Function For handler.upload Image ===============================================//

app.post("/profile", handler.upload, (req, res) => {
    res.send("file upload")
});


// Protected route using the handler.verifyToken middleware
app.get('/protected', handler.verifyToken, controller.protected)

//=========================================== KMS API START =====================================================//

/************************ upload Documents API for Query ******************* */
app.post("/uploadDocuments", handler.upload, controller.uploadDocuments)

/************************ Get Documents API for Query ******************* */
app.get('/file/:path', controller.file)

/************************ Registration API for Users in KMS ******************* */
// app.post("/registration", handler.upload, controller.Registration)

/************************ Login API for Users in KMS ******************* */
app.post("/login", handler.upload, controller.login)


/************************ Save Question and Options of KMS ******************* */
app.post("/saveQuestion", handler.verifyToken, controller.saveQuestion)

/************************ Get Question By Next and Pre Action Id Id of KMS ******************* */
app.post('/getQuestionById', handler.verifyToken, controller.getQuestionById)



app.get("/getSchenarioImageType", controller.getSchenarioImageType)

/************************ Delete Qestions and Options bye Scene Id of KMS ******************* */
// app.post('/deleteSceine', controller.deleteSceine)


app.post("/Registration", controller.Registration);
app.post("/UpdateUser", handler.upload, controller.UpdateUser);
app.post("/GetAllUsers", controller.GetAllUsers);
app.post("/GetUserById", controller.GetUserById);
app.post("/DeleteUser", controller.DeleteUser);


// Destination
app.post("/saveDestination", handler.upload, controller.saveDestination);
app.post("/editDestination", handler.upload, controller.editDestination);
app.post("/deleteDestination", controller.deleteDestination);
app.post("/viewDestinationById", controller.viewDestinationById);
app.post("/getAllDestinations", controller.getAllDestinations);
app.post("/updateDestinationStatus", controller.updateDestinationStatus);
app.post("/getDestinationsNamesAndIds", controller.getDestinationsNamesAndIds);

// Itinerary
app.post("/saveItinerary", handler.upload, controller.saveItinerary);
app.post("/editItinerary", handler.upload, controller.editItinerary);
app.post("/deleteItinerary", controller.deleteItinerary);
app.post("/getItineraryById", controller.getItineraryById);
app.post("/getItinerariesByDestination", controller.getItinerariesByDestination);
app.post("/updateItineraryStatus", controller.updateItineraryStatus);
app.post("/getItineraryNamesByDestination", controller.getItineraryNamesByDestination);

// Destination with Type
app.post("/saveDestinationWithType", controller.saveDestinationWithType);
app.post("/getDestinationWithType", controller.getDestinationWithType);

// Itinerary with Type
app.post("/saveItinerariesWithType", controller.saveItinerariesWithType);
app.post("/getItinerariesWithType", controller.getItinerariesWithType);

// Holiday Theme
app.post("/saveHolidayTheme", handler.upload, controller.saveHolidayTheme);
app.post("/updateHolidayTheme", handler.upload, controller.updateHolidayTheme);
app.post("/getHolidayThemeById", controller.getHolidayThemeById);
app.post("/softDeleteHolidayTheme", controller.softDeleteHolidayTheme);
app.post("/hardDeleteHolidayTheme", controller.hardDeleteHolidayTheme);
app.post("/getAllHolidayThemes", controller.getAllHolidayThemes);
app.post("/updateHolidayThemeStatus", controller.updateHolidayThemeStatus);

// Testimonial
app.post("/saveTestimonial", handler.upload, controller.saveTestimonial);
app.post("/updateTestimonial", handler.upload, controller.updateTestimonial);
app.post("/getAllTestimonials", controller.getAllTestimonials);
app.post("/getTestimonialById", controller.getTestimonialById);
app.post("/updateTestimonialStatus", controller.updateTestimonialStatus);
app.post("/deleteTestimonial", controller.deleteTestimonial);

// Partner
app.post("/addPartner", handler.upload, controller.addPartner);
app.post("/updatePartner", handler.upload, controller.updatePartner);
app.post("/updatePartner", handler.upload, controller.updatePartner);
app.post("/deletePartner", controller.deletePartner);
app.post("/getAllPartners", controller.getAllPartners);
app.post("/updatePartnerStatus", controller.updatePartnerStatus);
app.post("/getPartnerById", controller.getPartnerById);

// Vendor
app.post("/saveVendor", handler.upload, controller.saveVendor);
app.post("/updateVendor", handler.upload, controller.updateVendor);
app.post("/getAllVendors", controller.getAllVendors);
app.post("/getVendorById", controller.getVendorById);
app.post("/deleteVendor", controller.deleteVendor);
app.post("/updateVendorStatus", controller.updateVendorStatus);

// Lead
app.post("/createLead", controller.createLead);
app.post("/updateLead", handler.upload, controller.updateLead);
app.post("/getAllLeads", controller.getAllLeads);
app.post("/getLeadsByType", controller.getLeadsByType);
app.post("/deleteLead", controller.deleteLead);

// Agent
app.post("/createAgent", handler.upload, controller.createAgent);
app.post("/updateAgent", handler.upload, controller.updateAgent);
app.post("/getAllAgents", controller.getAllAgents);
app.post("/getAgentById", controller.getAgentById);
app.post("/deleteAgent", controller.deleteAgent);









/////////////================= Start Forget Password throw Email Section =======================/////////////


//==================================== Function for generate unique token =====================================//

const crypto = require('crypto');

function generateUniqueToken() {
    return crypto.randomBytes(20).toString('hex');
}

// Example usage
const resetToken = generateUniqueToken();
// console.log(resetToken,"tokennnnnnnnnnnnnnn");

const nodemailer = require('nodemailer');

//=================== Function for send OTP for forgot password on mail ======================//

// Configure nodemailer
const transporter = nodemailer.createTransport({
    // host: "email-smtp.us-east-1.amazonaws.com",
    service: 'gmail',
    auth: {
        user: 'nainjihora@gmail.com', // Your email address
        pass: 'qzxo ldiu mzcx znwk' // Your password for the email address
    }
});


//==================== API for Send OTP and Verify OTP By Email For Forgot Password ======================//

app.post('/sendOtpVerifyByEmail', async (req, res) => {
    console.log("sendOtpVerifyByEmail")
    const { email } = req.body;
    try {
        let user = await Registration.findOne({ email: email })
        if (!user) {
            return res.status(202).json({
                error: true,
                code: 202,
                message: "User not found.",
            });
        }
        // Generate random OTP
        const otp = randomstring.generate({
            length: 6,
            charset: 'numeric'
        });

        // Calculate OTP expiration time (5 minutes from now)
        const expire_at1 = moment().format("YYYY-MM-DD HH:mm:ss")
        const expire_at = moment().add(5, 'minutes').format("YYYY-MM-DD HH:mm:ss")
        const expire_time = moment().add(5, 'minutes').format("HH:mm:ss")

        // Email options
        const mailOptions = {
            from: 'nainjihora@gmail.com', // Replace with your Gmail address
            to: email,
            subject: 'OTP for Password Reset - KMS',
            text: `Your OTP is: ${otp}. It will expire on ${expire_time} and was sent at ${expire_at1}`
        };

        // Send email
        transporter.sendMail(mailOptions,async (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                res.status(500).json({ success: false, message: 'Error sending OTP' });
            } else {
                
                let existingDocument = await Email_otp.findOne({ email: email });

                if (existingDocument) {
                    // Update the existing document
                    let result = await Email_otp.findOneAndUpdate({ "email": email }, { "otp": otp, "expire_in": expire_at });
                    let result1 = await Email_otp.findOne({ "email": email },{_id:1,email:1,expire_in:1});
                    console.log('Email sent: ', info.response);
                    if (result) {
                        return res.status(201).json({
                            error: false,
                            code: 201,
                            message: `OTP sent successfully`,
                            data: result1
                        })
                    }
                } else {
                    // Save a new document
                    let newDocument = new Email_otp({ email: email, otp: otp, expire_in: expire_at });
                    let savedDocument = await newDocument.save();
                    let result1 = await Email_otp.findOne({ "email": email },{_id:1,email:1,expire_in:1});
                    console.log('Email sent: ', info.response);
                    if (savedDocument) {
                        return res.status(201).json({
                            error: false,
                            code: 201,
                            message: `OTP sent successfully`,
                            data: result1
                        })
                    }
                }
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: true,
            code: 500,
            message: "something went wrong"
        })
    }

});

app.post('/verifyOtpForEmail', async (req, res) => {
    try {
        if (req.body.email && req.body.email !== "") {
            console.log("inside email otp verification")
            let email = req.body.email;
            let otp = req.body.otp;
            let result = await Email_otp.findOne({ "email": email }, {_id:1, email:1, expire_in:1, otp:1 });
            // Check if OTP exists and matches
            if (result && result.otp == otp) {
                // Parse the expire_in field into a Date object
                const expirationTime = new Date(result.expire_in);
                const currentTime = new Date();

                // Check if OTP has expired
                if (currentTime > expirationTime) {
                    // OTP has expired
                    return res.status(400).json({
                        error: true,
                        code: 400,
                        message: "OTP has expired"
                    });
                } else {
                    // OTP is valid
                   
                    return res.status(200).json({
                        error: false,
                        code: 200,
                        message: "OTP successfully verified",
                        data: []
                    });
                }
            } else {
                // OTP not correct
                return res.status(201).json({
                    error: true,
                    code: 201,
                    message: "OTP not correct"
                });
            }
        } else {
            // Email not found
            return res.status(400).json({
                error: true,
                code: 400,
                message: "Email not found"
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: true,
            code: 500,
            message: "Something went wrong",
            data: err
        });
    }
});


//==================================== API for Reset password =====================================//

app.post('/forgetPassword', async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const email = req.body.email
    if (newPassword && confirmPassword && newPassword !== "") {
        if (newPassword == confirmPassword) {
            console.log("new password and confirm passwor match")
        } else {
            return res.status(201).json({
                error: true,
                code: 201,
                message: "password and confirm password not match"
            })
        }
    }
    else {
        return res.status(201).json({
            error: true,
            code: 201,
            message: "please enter password and confirm password"
        })
    }
    if (email) {
        Registration.findOne({ email }, async (err, user) => {
            if (err || !user) {

                return res.status(201).json({
                    error: true,
                    code: 201,
                    status: "failure",
                    message: "user does not exists !"
                })
            }
            else {



                let bPassword = await handler.bcryptPassword(newPassword)
                if (bPassword) {

                    Registration.updateOne({ email: user.email }, { $set: { password: bPassword } }, (error, docs) => {
                        if (!error && docs) {

                            return res.status(200).json({
                                error: false,
                                code: 200,
                                message: "Password Changed Successfully",
                                data: docs
                            });
                        }
                        else {
                            res.status(500).json({
                                error: true,
                                code: 500,
                                message: "error in updating password",
                                data: error
                            });
                        }
                    })
                } else {
                    res.status(201).json({
                        error: true,
                        code: 201,
                        message: "error in decrypt password"
                    })
                }

            }
        })
    }

})



/////////////================= End Forget Password Section =======================/////////////
