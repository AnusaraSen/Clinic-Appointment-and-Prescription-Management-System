const express = require("express");
const {
  getDoctorAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability,
  listAllAvailability,
} = require("../controllers/AvailabilityController");

const router = express.Router();

router.get("/doctor/:doctorId", getDoctorAvailability);
router.post("/", addAvailability);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);
router.get("/debug/all", listAllAvailability);

module.exports = router;
