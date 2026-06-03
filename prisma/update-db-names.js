const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database spelling correction...');

  // 1. Teekhi Hari Mirch -> spiciness = 3
  const r1 = await prisma.product.updateMany({
    where: { name: 'Teekhi Hari Mirch' },
    data: { spiciness: 3 }
  });
  console.log(`Updated Teekhi Hari Mirch spiciness: ${r1.count} row(s)`);

  // 2. Kayri with Kabuli Chana -> spiciness = 2
  const r2 = await prisma.product.updateMany({
    where: { name: 'Kayri with Kabuli Chana' },
    data: { spiciness: 2 }
  });
  console.log(`Updated Kayri with Kabuli Chana spiciness: ${r2.count} row(s)`);

  // 3. Kayri with Desi Chana -> spiciness = 2
  const r3 = await prisma.product.updateMany({
    where: { name: 'Kayri with Desi Chana' },
    data: { spiciness: 2 }
  });
  console.log(`Updated Kayri with Desi Chana spiciness: ${r3.count} row(s)`);

  // 4. Lehsua -> spiciness = 1
  const r4 = await prisma.product.updateMany({
    where: { name: 'Lehsua' },
    data: { spiciness: 1 }
  });
  console.log(`Updated Lehsua spiciness: ${r4.count} row(s)`);

  // 5. Kayri ka Khatta -> spiciness = 2
  const r5 = await prisma.product.updateMany({
    where: { name: 'Kayri ka Khatta' },
    data: { spiciness: 2 }
  });

  // 6. Kayri ka Meetha -> spiciness = 0
  const r6 = await prisma.product.updateMany({
    where: { name: 'Kayri ka Meetha' },
    data: { spiciness: 0 }
  });

  // 7. Kayri with Onion -> spiciness = 2
  const r7 = await prisma.product.updateMany({
    where: { name: 'Kayri with Onion' },
    data: { spiciness: 2 }
  });

  // 8. Nimbu Khatta Meetha -> spiciness = 1
  const r8 = await prisma.product.updateMany({
    where: { name: 'Nimbu Khatta Meetha' },
    data: { spiciness: 1 }
  });


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
