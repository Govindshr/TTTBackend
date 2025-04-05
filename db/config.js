const mongoose = require("mongoose");

mongoose.set("strictQuery", true);


// let url = "mongodb+srv://singhkumaramit2019:cGiOlc0Xd5yG6Yhs@cluster0.jvsyd.mongodb.net/travelers?retryWrites=true&w=majority&appName=Cluster0"
let url = "mongodb://trippingtales:w2L$B3qjI6c$KQ@3.110.118.223:27017/test"

mongoose.connect(url,
{useNewUrlParser : true},(err,result)=>{
    if(err){
        console.log("not Connected",err)
    }else{
    console.log("db Connected")
    }

});

