import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding database...");

    // ─── SKU Master ─────────────────────────────────────────────────────
    const skus = await Promise.all([
        prisma.skuMaster.create({
            data: {
                sku: "DS-BN-HT-FL",
                productCategory: "bench",
                productDescription: "Heated Bench with Flange connections",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-BN-HY-DF",
                productCategory: "bench",
                productDescription: "Hybrid Bench with Diffuser connections",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-HT-MD",
                productCategory: "heater",
                productDescription: "Modulating Heater",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-HT-400K",
                productCategory: "heater",
                productDescription: "400K BTU Fixed Heater",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-AC-15K",
                productCategory: "ac_unit",
                productDescription: "15,000 BTU AC Unit",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-CP-STD",
                productCategory: "compressor",
                productDescription: "Standard Compressor",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-CT-STD",
                productCategory: "cooling_tower",
                productDescription: "Standard Cooling Tower",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-SH-STD",
                productCategory: "shader",
                productDescription: "Standard Shader Canopy",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-HB-STD",
                productCategory: "hot_box",
                productDescription: "Standard Hot Box",
                isSerialized: true,
            },
        }),
        prisma.skuMaster.create({
            data: {
                sku: "DS-QI-HD-12",
                productCategory: "heater",
                productDescription: "Heater Duct 12 inch",
                isSerialized: false,
                notes: "Quantity-tracked item",
            },
        }),
    ]);

    console.log(`  Created ${skus.length} SKUs`);

    // ─── Customers ──────────────────────────────────────────────────────
    const customers = await Promise.all([
        prisma.customer.create({
            data: {
                teamName: "Cleveland Browns",
                league: "nfl",
                organizationLegalName: "Cleveland Browns Football Company LLC",
                primaryContactName: "Mike Thompson",
                primaryContactEmail: "mthompson@clevelandbrowns.com",
                primaryContactPhone: "216-555-0101",
                stadiumName: "Huntington Bank Field",
                stadiumAddress: "100 Alfred Lerner Way, Cleveland, OH 44114",
                contractType: "multi_year_lease",
                contractStartDate: new Date("2024-06-01"),
                contractEndDate: new Date("2027-05-31"),
                activeStatus: "active",
            },
        }),
        prisma.customer.create({
            data: {
                teamName: "Kansas City Chiefs",
                league: "nfl",
                organizationLegalName: "Kansas City Chiefs Football Club Inc.",
                primaryContactName: "Sarah Martinez",
                primaryContactEmail: "smartinez@chiefs.com",
                primaryContactPhone: "816-555-0202",
                stadiumName: "GEHA Field at Arrowhead Stadium",
                stadiumAddress: "1 Arrowhead Dr, Kansas City, MO 64129",
                contractType: "multi_year_lease",
                contractStartDate: new Date("2023-07-01"),
                contractEndDate: new Date("2026-06-30"),
                activeStatus: "active",
            },
        }),
        prisma.customer.create({
            data: {
                teamName: "Jacksonville Jaguars",
                league: "nfl",
                organizationLegalName: "Jacksonville Jaguars LLC",
                primaryContactName: "David Chen",
                primaryContactEmail: "dchen@jaguars.com",
                primaryContactPhone: "904-555-0303",
                stadiumName: "EverBank Stadium",
                stadiumAddress: "1 EverBank Field Dr, Jacksonville, FL 32202",
                contractType: "seasonal_rental",
                contractStartDate: new Date("2025-08-01"),
                contractEndDate: new Date("2026-02-28"),
                activeStatus: "active",
            },
        }),
        prisma.customer.create({
            data: {
                teamName: "Ohio State Buckeyes",
                league: "ncaa_fbs",
                organizationLegalName: "The Ohio State University Athletics",
                primaryContactName: "Jennifer Walsh",
                primaryContactEmail: "walsh.jennifer@osu.edu",
                primaryContactPhone: "614-555-0404",
                stadiumName: "Ohio Stadium",
                stadiumAddress: "411 Woody Hayes Dr, Columbus, OH 43210",
                contractType: "seasonal_rental",
                contractStartDate: new Date("2025-08-15"),
                contractEndDate: new Date("2026-01-15"),
                activeStatus: "active",
            },
        }),
        prisma.customer.create({
            data: {
                teamName: "Miami Dolphins",
                league: "nfl",
                organizationLegalName: "Miami Dolphins Ltd.",
                primaryContactName: "Carlos Rivera",
                primaryContactEmail: "crivera@miamidolphins.com",
                primaryContactPhone: "305-555-0505",
                stadiumName: "Hard Rock Stadium",
                stadiumAddress: "347 Don Shula Dr, Miami Gardens, FL 33056",
                contractType: "seasonal_rental",
                contractStartDate: new Date("2025-09-01"),
                contractEndDate: new Date("2026-04-15"),
                activeStatus: "prospect",
            },
        }),
    ]);

    console.log(`  Created ${customers.length} customers`);

    // ─── Serialized Assets ──────────────────────────────────────────────
    const benchData = [
        { serial: "DS-BN-2023-001", mfr: "Dragon Seats", type: "Heated", fd: "Flange", wheel: "Pneumatic", vents: true, year: 2023, branding: "branded" as const, bt: "team" as const, bd: "Cleveland Browns", location: "deployed_customer" as const, status: "deployed_customer" as const, customer: customers[0].id, sku: skus[0].id },
        { serial: "DS-BN-2023-002", mfr: "Dragon Seats", type: "Heated", fd: "Flange", wheel: "Pneumatic", vents: true, year: 2023, branding: "branded" as const, bt: "team" as const, bd: "Cleveland Browns", location: "deployed_customer" as const, status: "deployed_customer" as const, customer: customers[0].id, sku: skus[0].id },
        { serial: "DS-BN-2023-003", mfr: "Dragon Seats", type: "Hybrid", fd: "Diffuser", wheel: "Solid", vents: false, year: 2023, branding: "branded" as const, bt: "team" as const, bd: "Kansas City Chiefs", location: "deployed_customer" as const, status: "deployed_customer" as const, customer: customers[1].id, sku: skus[1].id },
        { serial: "DS-BN-2024-001", mfr: "Dragon Seats", type: "Heated", fd: "Flange", wheel: "Pneumatic", vents: true, year: 2024, branding: "unbranded" as const, bt: null, bd: null, location: "cleveland_warehouse" as const, status: "in_warehouse_available" as const, customer: null, sku: skus[0].id },
        { serial: "DS-BN-2024-002", mfr: "Dragon Seats", type: "Heated", fd: "Flange", wheel: "Pneumatic", vents: true, year: 2024, branding: "unbranded" as const, bt: null, bd: null, location: "cleveland_warehouse" as const, status: "in_warehouse_available" as const, customer: null, sku: skus[0].id },
        { serial: "DS-BN-2024-003", mfr: "Dragon Seats", type: "Hybrid", fd: "Diffuser", wheel: "Solid", vents: false, year: 2024, branding: "unbranded" as const, bt: null, bd: null, location: "kansas_city_warehouse" as const, status: "in_warehouse_available" as const, customer: null, sku: skus[1].id },
        { serial: "DS-BN-2024-004", mfr: "Dragon Seats", type: "Heated", fd: "Flange", wheel: "Pneumatic", vents: true, year: 2024, branding: "branded" as const, bt: "one_off_event" as const, bd: "Super Bowl LIX", location: "kansas_city_warehouse" as const, status: "in_warehouse_reserved" as const, customer: null, sku: skus[0].id },
        { serial: "DS-BN-2022-001", mfr: "Dragon Seats", type: "Heated", fd: "Flange", wheel: "Pneumatic", vents: true, year: 2022, branding: "unbranded" as const, bt: null, bd: null, location: "jacksonville_warehouse" as const, status: "in_warehouse_available" as const, customer: null, sku: skus[0].id },
        { serial: "DS-BN-2025-001", mfr: "Dragon Seats", type: "Hybrid", fd: "Diffuser", wheel: "Solid", vents: false, year: 2025, branding: "unbranded" as const, bt: null, bd: null, location: "cleveland_warehouse" as const, status: "ordered" as const, customer: null, sku: skus[1].id },
        { serial: "DS-BN-2021-001", mfr: "Dragon Seats", type: "Heated", fd: "Flange", wheel: "Pneumatic", vents: true, year: 2021, branding: "unbranded" as const, bt: null, bd: null, location: "cleveland_warehouse" as const, status: "retired" as const, customer: null, sku: skus[0].id },
    ];

    const benches = await Promise.all(
        benchData.map((b) =>
            prisma.serializedAsset.create({
                data: {
                    serialNumber: b.serial,
                    skuId: b.sku,
                    productCategory: "bench",
                    productTypeModel: `${b.type} Bench`,
                    lifecycleStatus: b.status,
                    currentLocation: b.location,
                    customerId: b.customer,
                    dateAcquired: new Date(`${b.year}-01-15`),
                    responsiblePerson: "Operations Team",
                    manufacturer: b.mfr,
                    benchType: b.type,
                    flangeOrDiffuser: b.fd,
                    wheelType: b.wheel,
                    ventHoles: b.vents,
                    yearManufactured: b.year,
                    brandingStatus: b.branding,
                    brandingType: b.bt,
                    brandingDescription: b.bd,
                },
            }),
        ),
    );

    // Heaters
    const heaters = await Promise.all([
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-HT-2023-001",
                skuId: skus[2].id,
                productCategory: "heater",
                productTypeModel: "Modulating Heater",
                lifecycleStatus: "deployed_customer",
                currentLocation: "deployed_customer",
                customerId: customers[0].id,
                dateAcquired: new Date("2023-03-01"),
                responsiblePerson: "Operations Team",
                heaterType: "Modulating",
                btuLevel: "Modulating",
            },
        }),
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-HT-2023-002",
                skuId: skus[3].id,
                productCategory: "heater",
                productTypeModel: "400K BTU Fixed Heater",
                lifecycleStatus: "in_warehouse_available",
                currentLocation: "cleveland_warehouse",
                dateAcquired: new Date("2023-06-15"),
                responsiblePerson: "Operations Team",
                heaterType: "Fixed",
                btuLevel: "400000",
            },
        }),
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-HT-2024-001",
                skuId: skus[2].id,
                productCategory: "heater",
                productTypeModel: "Modulating Heater",
                lifecycleStatus: "in_warehouse_available",
                currentLocation: "kansas_city_warehouse",
                dateAcquired: new Date("2024-02-10"),
                responsiblePerson: "Operations Team",
                heaterType: "Modulating",
                btuLevel: "Modulating",
            },
        }),
    ]);

    // AC Units
    const acUnits = await Promise.all([
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-AC-2023-001",
                skuId: skus[4].id,
                productCategory: "ac_unit",
                productTypeModel: "15K BTU AC Unit",
                lifecycleStatus: "in_warehouse_available",
                currentLocation: "jacksonville_warehouse",
                dateAcquired: new Date("2023-04-20"),
                responsiblePerson: "Operations Team",
                btuRating: 15000,
                amps: 20,
            },
        }),
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-AC-2024-001",
                skuId: skus[4].id,
                productCategory: "ac_unit",
                productTypeModel: "15K BTU AC Unit",
                lifecycleStatus: "deployed_customer",
                currentLocation: "deployed_customer",
                customerId: customers[2].id,
                dateAcquired: new Date("2024-01-10"),
                responsiblePerson: "Operations Team",
                btuRating: 15000,
                amps: 20,
            },
        }),
    ]);

    // Other equipment
    const others = await Promise.all([
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-CP-2023-001",
                skuId: skus[5].id,
                productCategory: "compressor",
                productTypeModel: "Standard Compressor",
                lifecycleStatus: "in_warehouse_available",
                currentLocation: "cleveland_warehouse",
                dateAcquired: new Date("2023-05-01"),
                responsiblePerson: "Operations Team",
            },
        }),
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-CT-2024-001",
                skuId: skus[6].id,
                productCategory: "cooling_tower",
                productTypeModel: "Standard Cooling Tower",
                lifecycleStatus: "in_warehouse_available",
                currentLocation: "kansas_city_warehouse",
                dateAcquired: new Date("2024-03-15"),
                responsiblePerson: "Operations Team",
            },
        }),
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-SH-2023-001",
                skuId: skus[7].id,
                productCategory: "shader",
                productTypeModel: "Standard Shader",
                lifecycleStatus: "deployed_customer",
                currentLocation: "deployed_customer",
                customerId: customers[1].id,
                dateAcquired: new Date("2023-07-20"),
                responsiblePerson: "Operations Team",
            },
        }),
        prisma.serializedAsset.create({
            data: {
                serialNumber: "DS-HB-2024-001",
                skuId: skus[8].id,
                productCategory: "hot_box",
                productTypeModel: "Standard Hot Box",
                lifecycleStatus: "in_warehouse_available",
                currentLocation: "jacksonville_warehouse",
                dateAcquired: new Date("2024-06-01"),
                responsiblePerson: "Operations Team",
            },
        }),
    ]);

    const totalAssets = benches.length + heaters.length + acUnits.length + others.length;
    console.log(`  Created ${totalAssets} serialized assets`);

    // ─── Quantity Inventory ─────────────────────────────────────────────
    const qtyItems = await Promise.all([
        prisma.quantityInventory.create({ data: { itemCategory: "Heater Ducts", itemVariant: null, location: "cleveland_warehouse", quantityOnHand: 45, reorderLevel: 20, lastCountDate: new Date("2026-01-15"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "AC Ducts", itemVariant: null, location: "cleveland_warehouse", quantityOnHand: 30, reorderLevel: 15, lastCountDate: new Date("2026-01-15"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Extension Cords", itemVariant: null, location: "cleveland_warehouse", quantityOnHand: 60, reorderLevel: 25, lastCountDate: new Date("2026-01-15"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Flanges", itemVariant: "12 inch", location: "cleveland_warehouse", quantityOnHand: 8, reorderLevel: 10, lastCountDate: new Date("2026-01-10"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Flanges", itemVariant: "6 inch", location: "cleveland_warehouse", quantityOnHand: 12, reorderLevel: 10, lastCountDate: new Date("2026-01-10"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "AC Nozzles", itemVariant: "Gen1", location: "jacksonville_warehouse", quantityOnHand: 15, reorderLevel: 10, lastCountDate: new Date("2026-01-08"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "AC Nozzles", itemVariant: "Gen2", location: "jacksonville_warehouse", quantityOnHand: 20, reorderLevel: 10, lastCountDate: new Date("2026-01-08"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Shader Spreader Bars", itemVariant: null, location: "kansas_city_warehouse", quantityOnHand: 18, reorderLevel: 8, lastCountDate: new Date("2026-01-12"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Wheel-set Hardware", itemVariant: null, location: "kansas_city_warehouse", quantityOnHand: 5, reorderLevel: 10, lastCountDate: new Date("2026-01-12"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Hot Hats", itemVariant: null, location: "jacksonville_warehouse", quantityOnHand: 22, reorderLevel: 10, lastCountDate: new Date("2026-01-05"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Diffusers", itemVariant: null, location: "cleveland_warehouse", quantityOnHand: 35, reorderLevel: 15, lastCountDate: new Date("2026-01-15"), responsiblePerson: "Operations Team" } }),
        prisma.quantityInventory.create({ data: { itemCategory: "Caps", itemVariant: "12 inch", location: "kansas_city_warehouse", quantityOnHand: 14, reorderLevel: 8, lastCountDate: new Date("2026-01-12"), responsiblePerson: "Operations Team" } }),
    ]);

    console.log(`  Created ${qtyItems.length} quantity inventory items`);

    // ─── Deployments ────────────────────────────────────────────────────
    const deployments = await Promise.all([
        prisma.deployment.create({
            data: {
                assetId: benches[0].id,
                customerId: customers[0].id,
                deploymentDate: new Date("2025-09-01"),
                expectedReturnDate: new Date("2026-02-15"),
                deploymentNotes: "2025-26 season deployment, home sideline",
            },
        }),
        prisma.deployment.create({
            data: {
                assetId: benches[1].id,
                customerId: customers[0].id,
                deploymentDate: new Date("2025-09-01"),
                expectedReturnDate: new Date("2026-02-15"),
                deploymentNotes: "2025-26 season deployment, visitor sideline",
            },
        }),
        prisma.deployment.create({
            data: {
                assetId: benches[2].id,
                customerId: customers[1].id,
                deploymentDate: new Date("2025-08-15"),
                expectedReturnDate: new Date("2026-02-28"),
                deploymentNotes: "2025-26 season deployment, home sideline",
            },
        }),
        prisma.deployment.create({
            data: {
                assetId: heaters[0].id,
                customerId: customers[0].id,
                deploymentDate: new Date("2025-09-01"),
                expectedReturnDate: new Date("2026-02-15"),
                deploymentNotes: "Supporting heater for bench deployment",
            },
        }),
        prisma.deployment.create({
            data: {
                assetId: acUnits[1].id,
                customerId: customers[2].id,
                deploymentDate: new Date("2025-09-10"),
                expectedReturnDate: new Date("2026-01-31"),
                deploymentNotes: "AC unit for Jacksonville warm weather games",
            },
        }),
        prisma.deployment.create({
            data: {
                assetId: others[2].id,
                customerId: customers[1].id,
                deploymentDate: new Date("2025-08-15"),
                expectedReturnDate: new Date("2026-02-28"),
                deploymentNotes: "Shader for KC home sideline",
            },
        }),
    ]);

    console.log(`  Created ${deployments.length} deployments`);

    // ─── Transfers ──────────────────────────────────────────────────────
    const transfers = await Promise.all([
        prisma.transfer.create({
            data: {
                assetId: heaters[2].id,
                originLocation: "cleveland_warehouse",
                destinationLocation: "kansas_city_warehouse",
                transferDate: new Date("2025-07-20"),
                transferInitiatedBy: "Mike Thompson",
                transferReceivedBy: "Sarah Martinez",
                transferStatus: "received",
                notes: "Pre-season equipment redistribution",
            },
        }),
        prisma.transfer.create({
            data: {
                itemId: qtyItems[8].id,
                quantity: 10,
                originLocation: "cleveland_warehouse",
                destinationLocation: "kansas_city_warehouse",
                transferDate: new Date("2026-02-10"),
                transferInitiatedBy: "Operations Team",
                transferStatus: "in_transit",
                notes: "Restocking wheel-set hardware at KC",
            },
        }),
    ]);

    console.log(`  Created ${transfers.length} transfers`);
    console.log("Seeding complete!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
