const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Renaming Kayri -> Keri in Database...");
  const products = await prisma.product.findMany();
  let count = 0;
  for (const p of products) {
    let updated = false;
    let newName = p.name;
    let newImageUrl = p.imageUrl;
    let newDescription = p.description;

    if (p.name.includes("Kayri")) {
      newName = p.name.replace(/Kayri/g, "Keri");
      updated = true;
    }
    if (p.name.includes("kayri")) {
      newName = p.name.replace(/kayri/g, "keri");
      updated = true;
    }
    if (p.imageUrl && p.imageUrl.includes("kayri")) {
      newImageUrl = p.imageUrl.replace(/kayri/g, "keri");
      updated = true;
    }
    if (p.description.includes("Kayri")) {
      newDescription = p.description.replace(/Kayri/g, "Keri");
      updated = true;
    }
    if (p.description.includes("kayri")) {
      newDescription = p.description.replace(/kayri/g, "keri");
      updated = true;
    }

    if (updated) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          name: newName,
          imageUrl: newImageUrl,
          description: newDescription
        }
      });
      console.log(`Updated Product ID ${p.id}: "${p.name}" -> "${newName}"`);
      count++;
    }
  }
  console.log(`Database renaming complete. Updated ${count} products.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
