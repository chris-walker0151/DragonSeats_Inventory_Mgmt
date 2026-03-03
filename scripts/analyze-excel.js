const XLSX = require("xlsx");
const wb = XLSX.readFile("/Users/johnfloyd/Desktop/DragonSeats/Dragon_Seats_Inventory_Cleaned.xlsx");
const ws = wb.Sheets["Bench Inventory"];
const data = XLSX.utils.sheet_to_json(ws);

function unique(arr) {
    return [...new Set(arr.filter(v => v !== undefined && v !== null))];
}

const teams24 = unique(data.map(r => r["Team Allocated 2024"]));
console.log("Team Allocated 2024 (" + teams24.length + " unique):");
console.log(teams24.join(" | "));

const teams25 = unique(data.map(r => r["Team Allocated 2025"]));
console.log("\nTeam Allocated 2025 (" + teams25.length + " unique):");
console.log(teams25.join(" | "));

const conds = unique(data.map(r => r["Condition"]));
console.log("\nCondition (" + conds.length + " unique):");
console.log(conds.join(" | "));

const notes = data.filter(r => r["Notes"]).map(r => r["Notes"]);
console.log("\nRows with Notes:", notes.length);
console.log("Sample:", notes.slice(0, 10));

// Location breakdown
const locs = {};
data.forEach(r => {
    const loc = r["Warehouse Location"] || "EMPTY";
    locs[loc] = (locs[loc] || 0) + 1;
});
console.log("\nLocation breakdown:");
Object.entries(locs).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log("  " + k + ": " + v));

// Obligations
const ws2 = wb.Sheets["Obligations"];
const obData = XLSX.utils.sheet_to_json(ws2);
console.log("\n=== Obligations (" + obData.length + " rows) ===");
obData.forEach(r => console.log(JSON.stringify(r)));
