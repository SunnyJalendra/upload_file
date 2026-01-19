import { uploadFile } from "../services/services.storage.js";
import { v4 as uuid } from "uuid";
import FileModel from "../models/file.model.js";
import userModel from "../models/user.model.js";

export const createFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const uploadResult = await uploadFile(req.file.buffer, uuid());
    const type = req.file.mimetype.startsWith("image") ? "image" : "pdf";
    const createdFile = await FileModel.create({
      owner: req.user._id,
      fileName: uploadResult.name,
      fileType: type,
      fileUrl: uploadResult.url,
    });
    const file = await FileModel.findById(createdFile._id).populate(
      "owner",
      "fullName email"
    );
    res.status(201).json({ success: true, file });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// all items files for adimn
export const getAllFiles = async (req, res) => {
  try {
    const files = await FileModel.find({}).populate("owner", "fullName email");

    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({
      message: "getAllFiles error: " + error.message,
    });
  }
};

// files which is uploaded by particular user

export const getUserFiles = async (req, res) => {
  try {
    // const {ownerId} = req.params;
    const files = await FileModel.find({ owner: req.user._id });
    res.status(200).json({ files });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete file by id
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find the file first
    const file = await FileModel.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check ownership or admin
    // Assuming req.user for normal users, req.admin for admin
    if (
      (!req.user || file.owner.toString() !== req.user._id.toString()) &&
      !req.admin
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this file" });
    }

    await FileModel.findByIdAndDelete(fileId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const shareFile = async (req, res) => {
  const { fileId } = req.params;
  const { email, permission } = req.body;

  const file = await FileModel.findById(fileId);
  if (!file) return res.status(404).json({ message: "File not found" });

  // only owner can share
  if (file.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const user = await userModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  file.sharedWith.push({
    user: user._id,
    permission,
  });

  await file.save();
  res.json({ message: "File shared successfully" });
};

export const sharedWithMe = async (req, res) => {
  try {
    const files = await FileModel.find({
      "sharedWith.user": req.user._id,
    })
      .populate("owner", "fullName email") // 👈 IMPORTANT
      .select("fileName fileType fileUrl sharedWith owner");

    // permission extract
    const formatted = files.map((file) => {
      const shared = file.sharedWith.find(
        (s) => s.user.toString() === req.user._id.toString()
      );

      return {
        _id: file._id,
        fileName: file.fileName,
        fileType: file.fileType,
        fileUrl: file.fileUrl,
        permission: shared.permission,
        owner: file.owner, // fullName + email
      };
    });

    res.json({ files: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const viewFile = async (req, res) => {
  const file = await FileModel.findById(req.params.fileId);
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  const isOwner = file.owner.toString() === req.user._id.toString();
  const shared = file.sharedWith.find(
    (u) => u.user.toString() === req.user._id.toString()
  );

  if (!isOwner && !shared) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({ fileUrl: file.fileUrl });
};


export const replaceFile = async (req, res) => {
  const file = await FileModel.findById(req.params.fileId);

  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const isOwner = file.owner.toString() === req.user._id.toString();

  const shared = file.sharedWith.find(
    (u) => u.user.toString() === req.user._id.toString()
  );

  // OWNER OR EDIT permission required
  if (!isOwner && (!shared || shared.permission !== "edit")) {
    return res.status(403).json({ message: "Edit not allowed" });
  }

  const uploadResult = await uploadFile(req.file.buffer, uuid());

  file.fileUrl = uploadResult.url;
  file.fileName = uploadResult.name;

  await file.save();

  res.json({ message: "File updated successfully" });
};

