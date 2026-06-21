const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rider = await prisma.rider.findFirst();
  if (!rider) {
    console.log("No rider found to assign the order to.");
    return;
  }

  // Create a dummy order
  const order = await prisma.order.create({
    data: {
      customerName: "Jane Doe (Test)",
      phone: "9988776655",
      address: "123 Spice Lane, Malviya Nagar",
      landmark: "Near World Trade Park",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302017",
      totalAmount: 450.0,
      status: "PACKED",
      paymentMethod: "COD"
    }
  });

  // Assign it to the rider
  const assignment = await prisma.riderAssignment.create({
    data: {
      riderId: rider.id,
      orderId: order.id,
      status: "ASSIGNED",
      clusterKey: "South Jaipur",
      codAmount: 450.0
    }
  });

  console.log("Dummy order created and assigned successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
