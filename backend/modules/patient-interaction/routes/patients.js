const express = require("express");
const mongoose = require("mongoose");
const Patient = require("../models/Patient.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Helpers
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Multer storage for medical files
const uploadDir = path.resolve(process.cwd(), "backend", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || "";
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

// Create patient
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.patient_id || !payload.name) {
      return res.status(400).json({ message: "patient_id and name are required" });
    }
    const existing = await Patient.findOne({ patient_id: payload.patient_id });
    if (existing) return res.status(409).json({ message: "patient_id already exists" });

    // Coerce dateOfBirth if provided as number or ISO or { $date: { $numberLong } }
    let dob = payload.dateOfBirth;
    if (dob && typeof dob === "object" && dob.$date && dob.$date.$numberLong) {
      dob = new Date(parseInt(dob.$date.$numberLong, 10));
    }
    if (typeof dob === "string" || typeof dob === "number") {
      dob = new Date(dob);
    }

    const doc = await Patient.create({
      patient_id: payload.patient_id,
      name: payload.name,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      dateOfBirth: dob,
      gender: payload.gender,
      address: payload.address,
      location: payload.location,
      postalCode: payload.postalCode,
      avatar: payload.avatar,
      medicalNotes: payload.medicalNotes,
    });
    return res.status(201).json(doc);
  } catch (err) {
    console.error("Create patient error", err);
    return res.status(500).json({ message: err.message || "Failed to create patient" });
  }
});

// List patients (basic pagination)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Patient.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(),
    ]);
    return res.json({ items, page, limit, total });
  } catch (err) {
    console.error("List patients error", err);
    return res.status(500).json({ message: err.message || "Failed to list patients" });
  }
});

// Get by Mongo ObjectId
router.get("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await Patient.findById(id);
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    return res.json(doc);
  } catch (err) {
    console.error("Get patient by id error", err);
    return res.status(500).json({ message: err.message || "Failed to get patient" });
  }
});

// Get by patient code (patient_id)
router.get("/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const doc = await Patient.findOne({ patient_id: code });
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    return res.json(doc);
  } catch (err) {
    console.error("Get patient by code error", err);
    return res.status(500).json({ message: err.message || "Failed to get patient" });
  }
});

// Update by id
router.put("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const payload = req.body || {};
    if (payload.dateOfBirth && typeof payload.dateOfBirth === "object" && payload.dateOfBirth.$date?.$numberLong) {
      payload.dateOfBirth = new Date(parseInt(payload.dateOfBirth.$date.$numberLong, 10));
    }
    const doc = await Patient.findByIdAndUpdate(id, payload, { new: true });
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    return res.json(doc);
  } catch (err) {
    console.error("Update patient by id error", err);
    return res.status(500).json({ message: err.message || "Failed to update patient" });
  }
});

// Update by patient code
router.put("/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const payload = req.body || {};
    if (payload.dateOfBirth && typeof payload.dateOfBirth === "object" && payload.dateOfBirth.$date?.$numberLong) {
      payload.dateOfBirth = new Date(parseInt(payload.dateOfBirth.$date.$numberLong, 10));
    }
    const doc = await Patient.findOneAndUpdate({ patient_id: code }, payload, { new: true });
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    return res.json(doc);
  } catch (err) {
    console.error("Update patient by code error", err);
    return res.status(500).json({ message: err.message || "Failed to update patient" });
  }
});

// Delete by id
router.delete("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await Patient.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete patient by id error", err);
    return res.status(500).json({ message: err.message || "Failed to delete patient" });
  }
});

// Delete by patient code
router.delete("/code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const doc = await Patient.findOneAndDelete({ patient_id: code });
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete patient by code error", err);
    return res.status(500).json({ message: err.message || "Failed to delete patient" });
  }
});

// Upload medical files
router.post("/id/:id/medical-files", upload.array("files", 10), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await Patient.findById(id);
    if (!doc) return res.status(404).json({ message: "Patient not found" });

    const files = (req.files || []).map((f) => ({
      originalName: f.originalname,
      filename: f.filename,
      mimeType: f.mimetype,
      size: f.size,
      url: `/uploads/${f.filename}`,
      uploadedAt: new Date(),
    }));

    doc.medicalFiles = [...(doc.medicalFiles || []), ...files];
    await doc.save();
    return res.json({ files: doc.medicalFiles });
  } catch (err) {
    console.error("Upload medical files error", err);
    return res.status(500).json({ message: err.message || "Failed to upload files" });
  }
});

// List medical files
router.get("/id/:id/medical-files", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await Patient.findById(id);
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    return res.json({ files: doc.medicalFiles || [] });
  } catch (err) {
    console.error("List medical files error", err);
    return res.status(500).json({ message: err.message || "Failed to list files" });
  }
});

// Delete medical file
router.delete("/id/:id/medical-files/:fileId", async (req, res) => {
  try {
    const { id, fileId } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await Patient.findById(id);
    if (!doc) return res.status(404).json({ message: "Patient not found" });
    const files = doc.medicalFiles || [];
    const idx = files.findIndex((f) => String(f._id) === String(fileId));
    if (idx === -1) return res.status(404).json({ message: "File not found" });

    const [removed] = files.splice(idx, 1);
    doc.medicalFiles = files;
    await doc.save();

    // Attempt to unlink local file (best-effort)
    if (removed?.filename) {
      const p = path.join(uploadDir, removed.filename);
      fs.existsSync(p) && fs.unlink(p, () => {});
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete medical file error", err);
    return res.status(500).json({ message: err.message || "Failed to delete file" });
  }
});

module.exports = router;
