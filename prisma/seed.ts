/* eslint-disable no-console */
import prisma from './prisma-client';
import { items, events, categories } from './seed-data';

async function main() {
  console.log('Start seeding based on PRD scenarios...');

  // Clear existing data
  await prisma.reservation.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.event.deleteMany();

  console.log('Cleared existing data.');

  // Create Categories
  const createdCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.create({
        data: cat,
      }),
    ),
  );
  console.log(`Created ${createdCategories.length} categories.`);

  // Create Items
  const createdItems = await Promise.all(
    items.map((item) => {
      const category = createdCategories.find(
        (c) => c.name === item.categoryName,
      );
      return prisma.item.create({
        data: {
          name: item.name,
          totalQuantity: item.totalQuantity,
          description: item.description,
          categoryId: category?.id,
        },
      });
    }),
  );
  console.log(`Created ${createdItems.length} items.`);

  const chair = createdItems.find((i) => i.name.includes('Стул'));
  const camera = createdItems.find((i) => i.name.includes('Sony'));
  const projector = createdItems.find((i) => i.name.includes('Проектор'));
  const tripod = createdItems.find((i) => i.name.includes('Tripod'));

  // Create Events
  const createdEvents = await Promise.all(
    events.map((event) =>
      prisma.event.create({
        data: event,
      }),
    ),
  );
  console.log(`Created ${createdEvents.length} events.`);

  const wedding = createdEvents.find((e) => e.title.includes('Свадьба'));
  const corporate = createdEvents.find((e) => e.title.includes('Корпоратив'));
  const conference = createdEvents.find((e) => e.title.includes('Конференция'));
  const photoshoot = createdEvents.find((e) => e.title.includes('Фотосессия'));

  // Create Reservations following PRD Scenarios
  const reservations = [];

  // Scenario A/B: Overlapping events for Chairs
  if (wedding && chair) {
    reservations.push({
      quantity: 30,
      itemId: chair.id,
      eventId: wedding.id,
    });
  }

  if (corporate && chair) {
    reservations.push({
      quantity: 10,
      itemId: chair.id,
      eventId: corporate.id,
    });
    // Total chairs used for 15.06-17.06: 40/50.
  }

  // Other reservations
  if (wedding && camera) {
    reservations.push({
      quantity: 1,
      itemId: camera.id,
      eventId: wedding.id,
    });
  }

  if (corporate && projector) {
    reservations.push({
      quantity: 1,
      itemId: projector.id,
      eventId: corporate.id,
    });
  }

  if (conference && chair) {
    // This event is FINISHED, so it shouldn't affect availability in June
    reservations.push({
      quantity: 45,
      itemId: chair.id,
      eventId: conference.id,
    });
  }

  if (photoshoot && camera && tripod) {
    reservations.push({
      quantity: 2,
      itemId: camera.id,
      eventId: photoshoot.id,
    });
    reservations.push({
      quantity: 1,
      itemId: tripod.id,
      eventId: photoshoot.id,
    });
  }

  await Promise.all(
    reservations.map((reservation) =>
      prisma.reservation.create({
        data: reservation,
      }),
    ),
  );
  console.log(`Created ${reservations.length} reservations.`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
