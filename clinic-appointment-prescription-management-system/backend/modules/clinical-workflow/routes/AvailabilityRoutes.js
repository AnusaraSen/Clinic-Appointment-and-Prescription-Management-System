const express = require("express");
const {
  getDoctorAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/AvailabilityController");

const router = express.Router();

router.get("/doctor/:doctorId", getDoctorAvailability);
router.post("/", addAvailability);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

module.exports = router;
