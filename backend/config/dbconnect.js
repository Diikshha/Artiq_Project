let mongoose = require("mongoose");
function connectToMongoDB(){
    let url = process.env.MONGO_URI;
    
    mongoose.connect(url).then(()=>{
        console.log("Connected to MongoDB")
    }).catch((err)=>{
        console.log(err)
    })
}
module.exports={connectToMongoDB}