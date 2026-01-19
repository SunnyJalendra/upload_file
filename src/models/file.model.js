import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  fileName: {
    type: String,
    required: true,
    trim: true,
  },

  fileType: {
    type: String,
    enum: ["image", "pdf"],
    required: true,
  },

  fileUrl: {
    type: String,
    required: true,
  },

  sharedWith: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      permission: {
        type: String,
        enum: ["view", "edit"],
        default: "view",
      },
    },
  ],
}, { timestamps: true });

const File = mongoose.model("File", fileSchema);
export default File;
