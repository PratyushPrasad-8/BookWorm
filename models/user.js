import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    profileImage:{
        type:String,
        default:""
    }
},{timestamps:true});

//Just before saving the password to DB we want this method to trigger so we use this is known as "hook" -> "pre", if we wanted after then "post"
userSchema.pre("save", async function (next){
    //If in future password is not modified we want to simply ignore hashing
    if(!this.isModified("password")) return next();

    const salt= await bcrypt.genSalt(10);//creating salt
    this.password= await bcrypt.hash(this.password, salt);//Hasing
    next();//Execute the next steps
})

//comparing password 
userSchema.methods.comparePassword = async function(userPassword){
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);
//naming convention: User ("User", U in caps and rest in small in singular form) --> Mongoose converts it in "users" all in small and in plural form
export default User;