/**
 * Development/default-content seed. Never creates participants, RSVPs or votes.
 * Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config();
const prisma = new PrismaClient();

async function main() {
  await prisma.event.upsert({
    where: { id: "main" },
    create: { id: "main" },
    update: {},
  });

  const schedule = [
    { time: "4:00 PM", title: "Welcome Gathering", note: "Hugs, hot chocolate and catching up." },
    { time: "5:00 PM", title: "Food & Refreshments", note: "The reunion feast begins." },
    { time: "6:30 PM", title: "Games", note: "Ludo, cricket and friendly rivalries." },
    { time: "8:00 PM", title: "Bonfire / Movie Night", note: "Stories under the winter sky." },
    { time: "9:15 PM", title: "Group Photos", note: "One for the scrapbook." },
    { time: "10:00 PM", title: "Closing Celebration", note: "Until we meet again." },
  ];
  await prisma.eventScheduleItem.deleteMany({ where: { eventId: "main" } });
  await prisma.eventScheduleItem.createMany({ data: schedule.map((item, i) => ({ ...item, eventId: "main", order: i })) });

  const decisions = [
    { key: "menu", label: "Menu", status: "Under Discussion" },
    { key: "venue", label: "Venue", status: "Under Discussion" },
    { key: "games", label: "Games", status: "Voting Open" },
    { key: "date", label: "Date", status: "Pending" },
    { key: "activities", label: "Activities", status: "Under Discussion" },
  ];
  for (const [i, decision] of decisions.entries()) {
    await prisma.planningDecision.upsert({
      where: { eventId_key: { eventId: "main", key: decision.key } },
      create: { ...decision, eventId: "main", order: i },
      update: { label: decision.label, status: decision.status },
    });
  }

  const polls = [
    { question: "Food Battle", category: "Food & Menu", options: ["BBQ", "Biryani", "Karahi", "Pizza"] },
    { question: "Games", category: "Games", options: ["Cricket", "Ludo", "UNO", "Badminton"] },
    { question: "Evening Entertainment", category: "Activities", options: ["Bonfire", "Movie Night", "Music & Games", "Storytelling"] },
  ];
  for (const poll of polls) {
    const existing = await prisma.poll.findFirst({ where: { question: poll.question } });
    if (!existing) {
      await prisma.poll.create({
        data: {
          question: poll.question,
          category: poll.category,
          options: { create: poll.options.map((label, i) => ({ label, order: i })) },
        },
      });
    }
  }

  const activities = [
    "Group Selfie", "Ludo Challenge", "Tell a Funny Story", "Dance Challenge",
    "Guess the Song", "Quick Trivia", "Truth or Dare — Family Friendly", "Best Dressed Cousin",
  ];
  await prisma.wheelActivity.deleteMany({});
  await prisma.wheelActivity.createMany({ data: activities.map((label, i) => ({ label, order: i })) });

  for (const name of ["Old Memories", "Funny Moments", "Family Gatherings", "Reunion 2026"]) {
    await prisma.memoryCategory.upsert({ where: { name }, create: { name }, update: {} });
  }

  console.log("Seed complete: default event, schedule, polls, wheel activities and gallery categories ready.");
  console.log("No fake participants, RSVPs or votes were created.");
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
