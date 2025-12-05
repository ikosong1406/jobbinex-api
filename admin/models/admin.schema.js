import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
