const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database spelling correction...');

  // 1. Teekha Hari Mirch -> Teekhi Hari Mirch
  const r1 = await prisma.product.updateMany({
    where: { name: 'Teekha Hari Mirch' },
    data: { name: 'Teekhi Hari Mirch' }
  });
  console.log(`Updated Teekha Hari Mirch: ${r1.count} row(s)`);

  // 2. Kayri with Kabli Chana -> Kayri with Kabuli Chana
  const r2 = await prisma.product.updateMany({
    where: { name: 'Kayri with Kabli Chana' },
    data: { name: 'Kayri with Kabuli Chana' }
  });
  console.log(`Updated Kayri with Kabli Chana: ${r2.count} row(s)`);

  // 3. Kayri with Deshi Chana -> Kayri with Desi Chana
  const r3 = await prisma.product.updateMany({
    where: { name: 'Kayri with Deshi Chana' },
    data: { name: 'Kayri with Desi Chana' }
  });
  console.log(`Updated Kayri with Deshi Chana: ${r3.count} row(s)`);

  // 4. Lasuwa -> Lehsua
  const r4 = await prisma.product.updateMany({
    where: { name: 'Lasuwa' },
    data: { 
      name: 'Lehsua',
      description: 'Authentic Rajasthani Lehsua (Gunda) pickle. A rare delicacy with incredible flavor.'
    }
  });
  console.log(`Updated Lasuwa: ${r4.count} row(s)`);

  console.log('Spelling correction completed successfully.');
}

main()
  .catch(e => {
    console.error('Error running spelling update:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
