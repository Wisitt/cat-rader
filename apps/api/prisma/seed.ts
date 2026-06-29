import "dotenv/config";
import { PrismaClient, RescueStatus, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const password = "PetRadar123!";

function approximateCoordinate(value: number) {
  return Number((Math.round(value * 500) / 500).toFixed(6));
}

async function main() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.internalNote.deleteMany(),
    prisma.caseStatusHistory.deleteMany(),
    prisma.rescueCase.deleteMany(),
    prisma.matchResult.deleteMany(),
    prisma.lostPet.deleteMany(),
    prisma.animalSighting.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(password, 12);
  const [admin, volunteer, owner, reporter] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@petradar.demo",
        displayName: "Admin Demo",
        role: UserRole.ADMIN,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "volunteer@petradar.demo",
        displayName: "Volunteer Demo",
        role: UserRole.VOLUNTEER,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "owner@petradar.demo",
        displayName: "Owner Demo",
        role: UserRole.PET_OWNER,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        email: "reporter@petradar.demo",
        displayName: "Reporter Demo",
        role: UserRole.REPORTER,
        passwordHash,
      },
    }),
  ]);

  const sightings = await Promise.all([
    prisma.animalSighting.create({
      data: {
        reporterId: reporter.id,
        species: "CAT",
        color: "orange tabby",
        pattern: "striped tail and white chest",
        description: "Friendly orange tabby seen near a temple gate, wearing a blue collar.",
        status: "POSSIBLE_LOST",
        urgency: "MEDIUM",
        verificationStatus: "VERIFIED",
        exactLatitude: 13.756392,
        exactLongitude: 100.501762,
        publicLatitude: approximateCoordinate(13.756392),
        publicLongitude: approximateCoordinate(100.501762),
        seenAt: new Date("2026-06-24T09:30:00.000Z"),
        photoUrls: [
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
        ],
      },
    }),
    prisma.animalSighting.create({
      data: {
        reporterId: reporter.id,
        species: "DOG",
        color: "black and tan",
        pattern: "tan eyebrows",
        description: "Injured medium dog resting under a bus stop bench. Limping on front leg.",
        status: "RESCUE_NEEDED",
        urgency: "EMERGENCY",
        verificationStatus: "VERIFIED",
        exactLatitude: 13.744812,
        exactLongitude: 100.534118,
        publicLatitude: approximateCoordinate(13.744812),
        publicLongitude: approximateCoordinate(100.534118),
        seenAt: new Date("2026-06-25T01:15:00.000Z"),
        photoUrls: [
          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
        ],
      },
    }),
    prisma.animalSighting.create({
      data: {
        reporterId: owner.id,
        species: "CAT",
        color: "gray",
        pattern: "white paws",
        description: "Small gray cat hiding near parked scooters. No visible collar.",
        status: "STRAY",
        urgency: "LOW",
        verificationStatus: "PENDING",
        exactLatitude: 13.730901,
        exactLongitude: 100.541702,
        publicLatitude: approximateCoordinate(13.730901),
        publicLongitude: approximateCoordinate(100.541702),
        seenAt: new Date("2026-06-25T05:45:00.000Z"),
      },
    }),
  ]);

  const lostPet = await prisma.lostPet.create({
    data: {
      ownerId: owner.id,
      petName: "Mango",
      species: "CAT",
      color: "orange tabby",
      pattern: "white chest and striped tail",
      description: "Mango is shy but responds to food. Blue collar with bell.",
      hasCollar: true,
      exactLatitude: 13.7551,
      exactLongitude: 100.502,
      publicLatitude: approximateCoordinate(13.7551),
      publicLongitude: approximateCoordinate(100.502),
      lastSeenAt: new Date("2026-06-22T11:00:00.000Z"),
      photoUrls: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
      ],
    },
  });

  await prisma.matchResult.create({
    data: {
      lostPetId: lostPet.id,
      sightingId: sightings[0].id,
      score: 95,
      level: "High",
      reasons: ["Species match", "Color match", "Collar mentioned", "Within 1 km", "Seen within 7 days"],
    },
  });

  const rescueCase = await prisma.rescueCase.create({
    data: {
      sightingId: sightings[1].id,
      assignedVolunteerId: volunteer.id,
      status: RescueStatus.ASSIGNED,
      priority: "EMERGENCY",
      summary: "Injured dog needs transport to partner clinic.",
    },
  });

  await prisma.caseStatusHistory.createMany({
    data: [
      {
        rescueCaseId: rescueCase.id,
        toStatus: "NEW",
        note: "Opened from verified rescue-needed sighting.",
        createdById: admin.id,
      },
      {
        rescueCaseId: rescueCase.id,
        fromStatus: "NEW",
        toStatus: "ASSIGNED",
        note: "Assigned to Volunteer Demo.",
        createdById: admin.id,
      },
    ],
  });

  await prisma.internalNote.create({
    data: {
      rescueCaseId: rescueCase.id,
      authorId: volunteer.id,
      body: "Contacted nearby clinic. Transport window confirmed this afternoon.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        type: "MATCH_FOUND",
        title: "High possible match for Mango",
        body: "A nearby orange tabby sighting scored 95/100.",
        metadata: { lostPetId: lostPet.id, sightingId: sightings[0].id },
      },
      {
        userId: volunteer.id,
        type: "RESCUE_ASSIGNED",
        title: "New rescue case assigned",
        body: "Injured dog needs transport to partner clinic.",
        metadata: { rescueCaseId: rescueCase.id },
      },
    ],
  });

  console.log("Seed complete");
  console.log(`Demo password for all users: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
