// Utility functions for dynamic calculations based on commissioning date

/**
 * Calculate days since commissioning date
 * @param {string} commissioningDate - Date in YYYY-MM-DD format
 * @returns {number} Number of days since commissioning
 */
function calculateDaysSince(commissioningDate) {
  const commissioning = new Date(commissioningDate);
  const today = new Date();

  // Reset time to start of day for accurate day calculation
  commissioning.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - commissioning.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Return 0 if commissioning date is in the future, minimum 1 day if same day
  return Math.max(0, diffDays);
}

/**
 * Calculate wood saved based on days since commissioning
 * @param {number} days - Number of days since commissioning
 * @returns {number} Wood saved in kg
 */
function calculateWoodSaved(days) {
  return days * 15; // 15 kg per day
}

/**
 * Calculate CO2 saved based on wood saved
 * @param {number} woodKg - Wood saved in kg
 * @returns {number} CO2 saved in kg
 */
function calculateCO2Saved(woodKg) {
  return woodKg * 1.65; // 1.65 times wood saved
}

/**
 * Calculate trees saved based on wood saved
 * @param {number} woodKg - Wood saved in kg
 * @returns {number} Number of trees saved
 */
function calculateTreesSaved(woodKg) {
  return woodKg / 500; // 1600 kg = 1 tree
}

/**
 * Calculate area saved based on trees saved
 * @param {number} trees - Number of trees saved
 * @returns {number} Area saved in acres
 */
function calculateAreaSaved(trees) {
  return trees / 500; // 500 trees = 1 acre
}

/**
 * Calculate carbon credits based on CO2 saved
 * @param {number} co2Kg - CO2 saved in kg
 * @returns {number} Carbon credits
 */
function calculateCarbonCredits(co2Kg) {
  return co2Kg / 1000; // 1000 kg CO2 = 1 carbon credit
}

/**
 * Calculate all values for an entry based on commissioning date
 * @param {string} commissioningDate - Date in YYYY-MM-DD format
 * @returns {object} All calculated values
 */
function calculateAllValues(commissioningDate) {
  const days = calculateDaysSince(commissioningDate);
  const woodKg = calculateWoodSaved(days);
  const co2Kg = calculateCO2Saved(woodKg);
  const co2Tons = co2Kg / 1000; // Convert to tons
  const trees = calculateTreesSaved(woodKg);
  const area = calculateAreaSaved(trees);
  const credits = calculateCarbonCredits(co2Kg);

  return {
    daysSinceCommissioning: days,
    woodSaved: woodKg.toFixed(2),
    co2Saved: co2Tons.toFixed(3), // in tCO2
    treesSaved: trees.toFixed(3),
    areaSaved: area.toFixed(6),
    carbonCredits: credits.toFixed(3),
  };
}

module.exports = {
  calculateDaysSince,
  calculateWoodSaved,
  calculateCO2Saved,
  calculateTreesSaved,
  calculateAreaSaved,
  calculateCarbonCredits,
  calculateAllValues,
};
