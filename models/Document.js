import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    data: { type: Object, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Document", DocumentSchema, "document");
