import express from "express";
import mongoose from "mongoose";

// Dynamic model to match existing 'prescriptions' collection with denormalized fields
const prescriptionSchema = new mongoose.Schema({}, { strict: false, collection: "prescriptions" });
const Prescription = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema, "prescriptions");

const router = express.Router();

// Normalize DB doc to frontend-friendly shape (camelCase)
function normalize(d) {
  const id = (d._id || d.id);
  const dateRaw = d.Date || d.date || d.created_at;
  return {
    id: (typeof id === "object" && id?.toString) ? id.toString() : String(id),
    patientId: d.patient_ID ?? d.patientId ?? "",
    patientName: d.patient_name ?? d.patientName ?? "",
    doctorName: d.doctor_Name ?? d.doctorName ?? "",
    date: dateRaw ? new Date(dateRaw).toISOString() : null,
    diagnosis: d.Diagnosis ?? d.diagnosis ?? "",
    symptoms: d.Symptoms ?? d.symptoms ?? "",
    medicines: Array.isArray(d.Medicines) ? d.Medicines.map(m => ({
      name: m.Medicine_Name ?? m.name ?? "",
      dosage: m.Dosage ?? m.dosage ?? "",
      frequency: m.Frequency ?? m.frequency ?? "",
      duration: m.Duration ?? m.duration ?? "",
    })) : (Array.isArray(d.medicines) ? d.medicines : []),
    instructions: d.Instructions ?? d.instructions ?? "",
  };
}

// GET /prescriptions/by-patient-code/:code
router.get("/by-patient-code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    if (!code || typeof code !== "string") return res.status(400).json({ error: "Invalid patient code" });

    // Determine limit: default 2, allow override via ?limit=, cap between 1 and 20
    const rawLimit = parseInt(String(req.query.limit ?? "2"), 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 2;

    const docs = await Prescription.find({ patient_ID: code })
      .sort({ Date: -1 })
      .limit(limit);
    const out = docs.map(d => normalize(d.toObject ? d.toObject() : d));
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /prescriptions/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid prescription id" });

    const doc = await Prescription.findById(id);
    if (!doc) return res.status(404).json({ error: "Prescription not found" });
    res.json(normalize(doc.toObject ? doc.toObject() : doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
