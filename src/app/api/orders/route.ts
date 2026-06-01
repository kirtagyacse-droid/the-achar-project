import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, phone, altPhone, address, landmark, city, state, pincode, notes, totalAmount, items } = body;

    // Validate
    if (!customerName || !phone || !address || !city || !state || !pincode || !items || items.length === 0) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create Order
    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        altPhone,
        address,
        landmark,
        city,
        state,
        pincode,
        notes,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Format Telegram Message
    let itemsText = '';
    order.items.forEach((item, index) => {
      itemsText += `${index + 1}. ${item.product.name} (x${item.quantity}) - ₹${item.price * item.quantity}\n`;
    });

    const telegramMessage = `
🚨 <b>NEW ORDER RECEIVED!</b> 🚨
<b>Order ID:</b> #${order.id.substring(0, 8).toUpperCase()}

👤 <b>Customer Details:</b>
Name: ${order.customerName}
Phone: ${order.phone}
${order.altPhone ? `Alt Phone: ${order.altPhone}` : ''}

📍 <b>Delivery Address:</b>
${order.address}
${order.landmark ? `Landmark: ${order.landmark}` : ''}
${order.city}, ${order.state} - ${order.pincode}

📝 <b>Notes:</b> ${order.notes || 'None'}

🛒 <b>Order Items:</b>
${itemsText}
💰 <b>Total Amount:</b> ₹${order.totalAmount}
💳 <b>Payment Method:</b> Cash on Delivery (COD)
`;

    // Send Notification
    await sendTelegramNotification(telegramMessage);

    return NextResponse.json({ message: 'Order created successfully', orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
