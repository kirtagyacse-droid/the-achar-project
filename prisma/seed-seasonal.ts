import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SUMMER_PRODUCTS = [
  {
    name: 'Karonda ka Khatta Meetha Achar',
    description: 'A rare summer specialty — wild Karonda berries sun-kissed to perfection and preserved in a sweet-tangy mustard oil brine. The quintessential summer companion for dal-chawal.',
    price: 200,
    season: 'summer',
    category: 'Summer Special',
    spiciness: 1,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
  {
    name: 'Sangri ka Achar',
    description: 'Dried desert beans of Rajasthan — Sangri — slow-marinated in cold-pressed mustard oil with traditional Rajasthani spices. A summer rarity you cannot find elsewhere.',
    price: 220,
    season: 'summer',
    category: 'Summer Special',
    spiciness: 2,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
  {
    name: 'Ker ka Achar',
    description: 'The wild desert caper (Ker) pickled the old Marwari way — tangy, pungent and utterly addictive. A true Rajasthani summer delicacy with roots in Bikaner.',
    price: 200,
    season: 'summer',
    category: 'Summer Special',
    spiciness: 2,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
];

const WINTER_PRODUCTS = [
  {
    name: 'Chuhara ka Pachak',
    description: 'Dried dates (Chuhara) mixed with digestive spices — a beloved winter digestive from Rajasthan. Sweet, warming, and wonderfully restorative on cold winter evenings.',
    price: 180,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 0,
    stockStatus: 'IN_STOCK',
    stockCount: 25,
  },
  {
    name: 'Tamatar ka Achar',
    description: 'Winter-fresh tomatoes slow-cooked with a secret masala blend and cold-pressed mustard oil. A Jaipur household staple that pairs with everything from roti to rice.',
    price: 160,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 2,
    stockStatus: 'IN_STOCK',
    stockCount: 25,
  },
  {
    name: 'Laal Mirchi ka Achar',
    description: 'Whole winter red chillies stuffed with aromatic spices and aged in mustard oil. Fire-forward, deeply spiced — a winter pickle that warms from the inside out.',
    price: 180,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 3,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
  {
    name: 'Gajar ka Achar',
    description: 'Crunchy winter carrots marinated in mustard seeds, fennel and turmeric. The most cheerful jar in your pantry — bright orange, tangy and absolutely moreish.',
    price: 160,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 1,
    stockStatus: 'IN_STOCK',
    stockCount: 30,
  },
  {
    name: 'Mooli ka Achar',
    description: 'Fresh winter radish cut and marinated overnight in our signature spice blend. Crisp, pungent and delightfully tangy — the classic Punjabi-Rajasthani winter ritual.',
    price: 150,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 1,
    stockStatus: 'IN_STOCK',
    stockCount: 25,
  },
  {
    name: 'Gajar & Mooli Mix Achar',
    description: 'The best of both worlds — fresh winter carrots and radish pickled together in mustard oil. A mixed crunch in every bite, seasoned with ajwain and kalonji.',
    price: 170,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 1,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
  {
    name: 'Oal ka Achar',
    description: 'Elephant yam (Oal/Jimikand) pickled with winter spices — a rare and deeply nourishing winter specialty. Earthy, complex and deeply satisfying.',
    price: 200,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 2,
    stockStatus: 'IN_STOCK',
    stockCount: 15,
  },
  {
    name: 'Adrak ka Achar',
    description: 'Fresh ginger root pickled with lemon juice, rock salt and Rajasthani spices. A digestive powerhouse — warm, sharp and wonderfully invigorating on cold winter mornings.',
    price: 170,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 2,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
  {
    name: 'Lehsun ka Achar',
    description: 'Whole garlic cloves aged slowly in mustard oil with black pepper and fennel. Pungent and deeply aromatic — a winter staple that transforms any simple meal into a feast.',
    price: 180,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 2,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
  {
    name: 'Adrak Nimbu ka Achar',
    description: 'Ginger meets lemon in this bright, zesty winter combination. Sharp ginger, tangy lime, rock salt and warming spices — the ultimate digestive and immunity booster.',
    price: 180,
    season: 'winter',
    category: 'Winter Special',
    spiciness: 1,
    stockStatus: 'IN_STOCK',
    stockCount: 20,
  },
];

const PANTRY_PRODUCTS = [
  {
    name: 'Moringa Powder',
    description: 'Wild-harvested Moringa leaves sun-dried and stone-ground. Earthy, nutrient-dense and deeply green — Rajasthan\'s ancient superfood, brought to your kitchen in its most pure form.',
    price: 250,
    season: 'pantry',
    category: 'From Our Pantry',
    spiciness: 0,
    imageUrl: '/images/moringa-powder.png',
    stockStatus: 'IN_STOCK',
    stockCount: 30,
  },
  {
    name: 'Chaat Masala',
    description: 'Our house-blend chaat masala — dry mango, black salt, cumin and pomegranate seeds stone-ground in small batches. The secret ingredient that makes everything taste alive.',
    price: 120,
    season: 'pantry',
    category: 'From Our Pantry',
    spiciness: 1,
    imageUrl: '/images/chaat-masala.png',
    stockStatus: 'IN_STOCK',
    stockCount: 40,
  },
];

async function main() {
  console.log('🌱 Seeding seasonal products...');

  const allProducts = [...SUMMER_PRODUCTS, ...WINTER_PRODUCTS, ...PANTRY_PRODUCTS];

  for (const p of allProducts) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p as any });
      console.log(`  ✅ Created: ${p.name}`);
    } else {
      await prisma.product.update({ where: { id: existing.id }, data: p as any });
      console.log(`  ↻  Updated: ${p.name}`);
    }
  }

  console.log('🎉 Seed complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
