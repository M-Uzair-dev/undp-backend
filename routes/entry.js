const express = require("express");
const router = express.Router();
const Entry = require("../models/Entry");
const {
  calculateDaysSince,
  calculateWoodSaved,
  calculateCO2Saved,
  calculateTreesSaved,
  calculateAreaSaved,
  calculateCarbonCredits,
} = require("../utils/calculations");

// GET entry by serial number with calculated values
router.get("/entry/:serialNumber", async (req, res) => {
  try {
    const { serialNumber } = req.params;
    const entry = await Entry.findOne({ serialNumber });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    // Calculate dynamic values based on commissioning date
    const daysSinceCommissioning = calculateDaysSince(
      entry.dateOfCommissioning
    );
    const woodSavedKg = calculateWoodSaved(daysSinceCommissioning);
    const co2SavedKg = calculateCO2Saved(woodSavedKg);
    const treesSaved = calculateTreesSaved(woodSavedKg);
    const areaSaved = calculateAreaSaved(treesSaved);
    const carbonCredits = calculateCarbonCredits(co2SavedKg);

    // Create response with calculated values
    const response = {
      ...entry.toObject(),
      calculatedValues: {
        daysSinceCommissioning,
        woodSaved: `${woodSavedKg.toFixed(2) / 1000} tons`,
        co2Saved: `${(co2SavedKg / 1000).toFixed(2)} tons`,
        treesSaved: treesSaved.toFixed(2),
        areaSaved: areaSaved.toFixed(5),
        carbonCredits: carbonCredits.toFixed(2),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching entry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET statistics for all entries with calculated values
router.get("/statistics", async (req, res) => {
  try {
    const entries = await Entry.find({});

    let totalWoodSaved = 0;
    let totalTreesSaved = 0;
    let totalAreaSaved = 0;
    let totalCo2Saved = 0;
    let totalCarbonCredits = 0;
    let totalDays = 0;

    entries.forEach((entry) => {
      // Calculate dynamic values for each entry
      const daysSinceCommissioning = calculateDaysSince(
        entry.dateOfCommissioning
      );
      const woodSavedKg = calculateWoodSaved(daysSinceCommissioning);
      const co2SavedKg = calculateCO2Saved(woodSavedKg);
      const treesSaved = calculateTreesSaved(woodSavedKg);
      const areaSaved = calculateAreaSaved(treesSaved);
      const carbonCredits = calculateCarbonCredits(co2SavedKg);

      // Add to totals
      totalWoodSaved += woodSavedKg;
      totalTreesSaved += treesSaved;
      totalAreaSaved += areaSaved;
      totalCo2Saved += co2SavedKg;
      totalCarbonCredits += carbonCredits;
      totalDays += daysSinceCommissioning;
    });

    const statistics = {
      totalEntries: entries.length,
      averageDaysSinceCommissioning:
        entries.length > 0 ? (totalDays / entries.length).toFixed(1) : 0,
      totalWoodSaved: `${totalWoodSaved.toFixed(2) / 1000} tons`,
      totalTreesSaved: totalTreesSaved.toFixed(2),
      totalAreaSaved: totalAreaSaved.toFixed(5),
      totalCo2Saved: `${(totalCo2Saved / 1000).toFixed(2)} tons`,
      totalCarbonCredits: totalCarbonCredits.toFixed(2),
    };

    res.json(statistics);
  } catch (error) {
    console.error("Error calculating statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
