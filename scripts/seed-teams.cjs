/**
 * Standalone script to seed the database with team info from the DS - Team Info spreadsheet.
 * Replaces all existing customers with the 86 teams from the xlsx.
 *
 * Usage: node scripts/seed-teams.cjs
 *
 * Requires DATABASE_URL in .env
 */

require("dotenv/config");
const { PrismaClient } = require("../src/generated/prisma/client.js");
const { PrismaPg } = require("@prisma/adapter-pg");
const teams = require("./team-data.json");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log(`Seeding ${teams.length} teams from DS - Team Info...`);

    // Delete all existing customers (cascades handled by DB)
    const deleted = await prisma.customer.deleteMany({});
    console.log(`  Deleted ${deleted.count} existing customers`);

    let created = 0;
    for (const team of teams) {
        await prisma.customer.create({
            data: {
                teamName: team.teamName,
                league: team.league,
                organizationLegalName: team.teamName,
                contractType: "seasonal_rental",
                activeStatus: "active",
                primaryContactName: team.primaryContactName || null,
                roadContactName: team.roadContactName || null,
                loadingDock: team.loadingDock || null,
                fieldType: team.fieldType || null,
                sidelineSetupNotes: team.sidelineSetupNotes || null,
                sidelineSetupDiagram: team.sidelineSetupDiagram || null,
                homeBenches: team.homeBenches ?? null,
                homeShaders: team.homeShaders || null,
                homeCooling: team.homeCooling || null,
                homeHeat: team.homeHeat || null,
                roadBenches: team.roadBenches ?? null,
                roadShaders: team.roadShaders || null,
                roadCooling: team.roadCooling || null,
                roadHeat: team.roadHeat || null,
            },
        });
        created++;
    }

    console.log(`  Created ${created} customers`);
    console.log("Team seeding complete!");
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
