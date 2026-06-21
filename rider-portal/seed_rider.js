const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const phone = '9876543210';
  const pin = '1234';
  const pinHash = bcrypt.hashSync(pin, 10);

  const rider = await prisma.rider.upsert({
    where: { phone },
    update: { pinHash },
    create: {
      name: 'Rider Bhai',
      phone,
      pinHash,
      isActive: true,
      locality: 'Downtown'
    }
  });

  console.log('Successfully seeded rider:');
  console.log('Phone:', rider.phone);
  console.log('PIN:', pin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
