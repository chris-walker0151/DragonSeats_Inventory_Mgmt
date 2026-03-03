/**
 * Import Dragon Seats bench inventory from Excel into PostgreSQL.
 * Usage: node scripts/import-excel.js
 */
const XLSX = require("xlsx");
const { Client } = require("pg");

const EXCEL_PATH = "/Users/johnfloyd/Desktop/DragonSeats/Dragon_Seats_Inventory_Cleaned.xlsx";
const DB_URL = "postgresql://johnfloyd@localhost:5432/dragon_seats_inventory?sslmode=disable";

function mapLocation(raw) {
    const loc = (raw || "").trim().toLowerCase();
    if (loc.includes("cleveland")) return { location: "cleveland_warehouse", lifecycle: "in_warehouse_available", deployed: null };
    if (loc.includes("kansas city")) return { location: "kansas_city_warehouse", lifecycle: "in_warehouse_available", deployed: null };
    if (loc.includes("jacksonville")) return { location: "jacksonville_warehouse", lifecycle: "in_warehouse_available", deployed: null };
    // Anything else is deployed
    return { location: "deployed_customer", lifecycle: "deployed_customer", deployed: raw.trim() };
}

async function main() {
    const wb = XLSX.readFile(EXCEL_PATH);
    const ws = wb.Sheets["Bench Inventory"];
    const rows = XLSX.utils.sheet_to_json(ws);

    console.log("Read", rows.length, "rows from Excel");

    const client = new Client({ connectionString: DB_URL });
    await client.connect();

    let inserted = 0;
    let errors = 0;

    for (const row of rows) {
        const assetNumber = (row["Asset Number"] || "").trim();
        if (!assetNumber) continue;

        const loc = mapLocation(row["Warehouse Location"]);

        const values = [
            assetNumber,                                        // serial_number
            "bench",                                            // product_category
            (row["Asset Type"] || "").trim() || null,           // product_type_model
            loc.lifecycle,                                      // lifecycle_status
            loc.location,                                       // current_location
            (row["Manufacturer"] || "").trim() || null,         // manufacturer
            (row["Wheel Style"] || "").trim() || null,          // wheel_type
            (row["Notes"] || "").trim() || null,                // notes
            (row["Condition"] || "").trim() || null,            // condition
            (row["Status"] || "").trim() || null,               // bench_status
            (row["Manifold Style"] || "").trim() || null,       // manifold_style
            (row["Deck Type"] || "").trim() || null,            // deck_type
            (row["Seat Type"] || "").trim() || null,            // seat_type
            (row["Compressor Holes"] || "").trim() || null,     // compressor_holes
            (row["AC Holes"] || "").trim() || null,             // ac_holes
            (row["DS Plate Number"] || "").trim() || null,      // ds_plate_number
            loc.deployed,                                       // deployed_location_name
            (row["Team Allocated 2024"] || "").trim() || null,  // team_allocated_2024
            (row["Team Allocated 2025"] || "").trim() || null,  // team_allocated_2025
        ];

        try {
            await client.query(`
                INSERT INTO serialized_assets (
                    id, serial_number, product_category, product_type_model,
                    lifecycle_status, current_location, manufacturer, wheel_type,
                    notes, condition, bench_status, manifold_style, deck_type,
                    seat_type, compressor_holes, ac_holes, ds_plate_number,
                    deployed_location_name, team_allocated_2024, team_allocated_2025,
                    created_at, updated_at
                ) VALUES (
                    gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9,
                    $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
                    NOW(), NOW()
                )
            `, values);
            inserted++;
        } catch (err) {
            console.error("Error inserting", assetNumber, ":", err.message);
            errors++;
        }
    }

    console.log("Done:", inserted, "inserted,", errors, "errors");
    await client.end();
}

main().catch(console.error);
