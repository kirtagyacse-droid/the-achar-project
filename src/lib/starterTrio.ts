import prisma from './prisma';

export async function ensureStarterTrio() {
  try {
    const existing = await prisma.product.findFirst({
      where: { name: "Aunty's Starter Trio" }
    });

    if (!existing) {
      console.log("Seeding Aunty's Starter Trio product...");
      const seeded = await prisma.product.create({
        data: {
          name: "Aunty's Starter Trio",
          description: "Three small 100g jars — one tangy, one spicy, one mild — to find your favourite before committing to a full jar. The perfect introduction.",
          price: 149,
          imageUrl: '/uploads/teekha-hari-mirch.jpg', // fallback image
          category: 'Pickle',
          spiciness: 2,
          stockStatus: 'IN_STOCK',
          stockCount: 99,
          tastingNotes: "Three iconic pickles (tangy, spicy, mild) packaged together in small trial size martabans. Perfect for first-timers.",
          sizes: [
            { label: "3 x 100g Jars", weightG: 300, price: 149 }
          ],
          flavorProfile: { tangy: 4, spicy: 3, sweet: 2, savory: 4, salty: 3 }
        }
      });
      return seeded;
    }
    return existing;
  } catch (error) {
    console.error("Failed to seed Starter Trio:", error);
    return null;
  }
}
