// Service for identifying potential investors

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const investors = require("../data/investors.json");

// Get all investors
export async function getInvestors() {
  return investors;
}

// Get investors by city
export async function getLocalInvestors(city) {

  if (!city || city === "All") {
    return investors;
  }

  return investors.filter(
    (inv) =>
      inv.city.toLowerCase() === city.toLowerCase()
  );
}