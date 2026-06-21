import bcryptjs from 'bcryptjs';
import prisma from './src/lib/prisma';

async function createRider() {
  const phone = process.argv[2];
  const name = process.argv[3];
  const pin = process.argv[4];
  const locality = process.argv[5] || 'Jaipur';

  if (!phone || !name || !pin) {
    console.log('Usage: npx tsx scripts/create-rider.ts <phone> <name> <pin> [locality]');
    console.log('Example: npx tsx scripts/create-rider.ts 9876543210 "Rajesh Kumar" 1234 "Malviya Nagar"');
    process.exit(1);
  }

  if (!/^\d{10}$/.test(phone) || !/^\d{4}$/.test(pin)) {
    console.log('Phone must be 10 digits, PIN must be 4 digits');
    process.exit(1);
  }

  const pinHash = bcryptjs.hashSync(pin, 10);

  try {
    const rider = await prisma.rider.create({
      data: { phone, name, pinHash, locality }
    });
    console.log('Created rider:', { id: rider.id, name: rider.name, phone: rider.phone });
  } catch (error) {
    console.error('Error creating rider:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRider();