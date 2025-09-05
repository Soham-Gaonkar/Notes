import mongoose from "mongoose"

// create a schema
// create a model based off that schema


const noteSchema = new mongoose.Schema({
    title: { type:String, required:true},
    content: { type:String, required:true},
}, 
{timestamps : true}
); // createdAt , updtedAt


const Note = mongoose.model("note", noteSchema);
export default Note;