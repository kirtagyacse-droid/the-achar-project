import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const products = [
    {
      name: 'Teekha Hari Mirch',
      description: 'Spicy and tangy green chili pickle made with authentic Rajasthani spices. Perfect to spice up any meal!',
      price: 450,
      imageUrl: '/uploads/teekha-hari-mirch.jpg',
      category: 'Pickle'
    },
    {
      name: 'Kayri ka Khatta',
      description: 'Classic sour mango pickle. The traditional taste of Rajasthan in every bite.',
      price: 600,
      imageUrl: '/uploads/kayri-ka-khatta.jpg',
      category: 'Pickle'
    },
    {
      name: 'Kayri ka Meetha',
      description: 'Sweet and sour mango pickle. A delicious treat that pairs wonderfully with parathas.',
      price: 600,
      imageUrl: '/uploads/kayri-ka-meetha.jpg',
      category: 'Pickle'
    },
    {
      name: 'Kayri with Kabli Chana',
      description: 'Mango pickle combined with chickpeas. A unique texture and burst of flavors.',
      price: 600,
      imageUrl: '/uploads/kayri-with-kabli-chana.jpg',
      category: 'Pickle'
    },
    {
      name: 'Kayri with Deshi Chana',
      description: 'Traditional mango pickle with desi chana. Packed with protein and authentic taste.',
      price: 600,
      imageUrl: '/uploads/kayri-with-deshi-chana.jpg',
      category: 'Pickle'
    },
    {
      name: 'Kayri with Onion',
      description: 'Mango and onion pickle. A savory delight that elevates your daily meals.',
      price: 600,
      imageUrl: '/uploads/kayri-with-onion.jpg',
      category: 'Pickle'
    },
    {
      name: 'Lasuwa',
      description: 'Authentic Rajasthani Lasode (Gunda) pickle. A rare delicacy with incredible flavor.',
      price: 700,
      imageUrl: '/uploads/lasuwa.jpg',
      category: 'Pickle'
    },
    {
      name: 'Nimbu Khatta Meetha',
      description: 'Sweet and sour lemon pickle. Aged to perfection for a rich, deep flavor profile.',
      price: 600,
      imageUrl: '/uploads/nimbu-khatta-meetha.jpg',
      category: 'Pickle'
    }
  ]

  console.log('Seeding products...')
  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }
  console.log('Done seeding.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
