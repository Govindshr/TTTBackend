const mongoose = require("mongoose");

mongoose.set("strictQuery", true);


// let url = "mongodb+srv://tolet:tolet@cluster0.nlbdxil.mongodb.net/kms_db?retryWrites=true&w=majority"
// let url = "mongodb+srv://akssmbr91:CqGu8uIfp2Hhs4hC@cluster0.mtbcggb.mongodb.net/kms_db?retryWrites=true&w=majority"
let url = "mongodb+srv://singhkumaramit2019:cGiOlc0Xd5yG6Yhs@cluster0.jvsyd.mongodb.net/travelers?retryWrites=true&w=majority&appName=Cluster0"
// let url = "mongodb://localhost:27017/kms_db"

mongoose.connect(url,
{useNewUrlParser : true},(err,result)=>{
    if(err){
        console.log("not Connected",err)
    }else{
    console.log("db Connected")
    }

});

