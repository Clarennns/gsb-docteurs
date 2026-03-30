const express = require("express");
const router = express.Router();
const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getReportsByVisitor,
} = require("../controllers/reportController");

router.get("/", getReports);
router.get("/visiteurs/:visiteurId", getReportsByVisitor);
router.get("/:id", getReportById);
router.post("/", createReport);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

module.exports = router;
