import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendTelegramNotification } from '@/lib/telegram';
import { sendAuntyNotification } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
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
      items,
      isGiftOrder,
      giftMessage,
      giftPackaging,
      referralCode
    } = body;

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
        referralCode: referralCode || null,
        isGiftOrder: isGiftOrder || false,
        giftMessage: giftMessage || null,
        giftPackaging: giftPackaging || null,
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

    // Process discount code if used
    if (referralCode) {
      const discountCode = referralCode.toUpperCase().trim();
      if (discountCode.startsWith('REF-')) {
        const referral = await prisma.referral.findUnique({
          where: { referralCode: discountCode }
        });
        if (referral && !referral.isUsed) {
          await prisma.referral.update({
            where: { referralCode: discountCode },
            data: {
              isUsed: true,
              usedByPhone: phone,
              usedByName: customerName,
              referrerCredit: { increment: 100 },
              refereeDiscount: 100
            }
          });
          
          // Notify Aunty via WhatsApp
          const refMessage = `🎉 Referral used! ${referral.referrerName} earned ₹100 credit. New customer: ${customerName}.`;
          await sendAuntyNotification(refMessage);
        }
      } else if (discountCode.startsWith('JAR-')) {
        await prisma.jarReturn.update({
          where: { id: discountCode },
          data: { discountApplied: true }
        });
      }
    }

    // Update product stock counts
    try {
      for (const item of items) {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (prod) {
          const newCount = Math.max(0, prod.stockCount - item.quantity);
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockCount: newCount,
              stockStatus: newCount === 0 ? 'OUT_OF_STOCK' : prod.stockStatus
            }
          });
        }
      }
    } catch (stockError) {
      console.error('Error updating stock counts:', stockError);
      // Don't fail the order if stock update fails, but log it
    }


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

🎁 <b>Gift Order:</b> ${order.isGiftOrder ? 'YES' : 'NO'}
${order.isGiftOrder ? `📦 <b>Packaging:</b> ${order.giftPackaging || 'Standard'}\n✉️ <b>Message:</b> "${order.giftMessage || 'None'}"\n` : ''}
📝 <b>Notes:</b> ${order.notes || 'None'}

🛒 <b>Order Items:</b>
${itemsText}
💰 <b>Total Amount:</b> ₹${order.totalAmount}
💳 <b>Payment Method:</b> Cash on Delivery (COD)
`;


    // Send Notification
    await sendTelegramNotification(telegramMessage);

    // Trigger WhatsApp CallMeBot Alert if configured
    const auntyPhone = process.env.AUNTY_WHATSAPP_NUMBER;
    const callmebotApiKey = process.env.CALLMEBOT_API_KEY;

    if (auntyPhone && callmebotApiKey) {
      try {
        const timeStr = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata'
        });
        const itemsList = order.items.map(item => `${item.product.name} × ${item.quantity}`).join(', ');
        const whatsappMsg = `🛒 New Order!
Customer: ${order.customerName}
Items: ${itemsList}
COD: ₹${order.totalAmount}
Address: ${order.address}
Time: ${timeStr}`;

        const encodedMsg = encodeURIComponent(whatsappMsg);
        const whatsappUrl = `https://api.callmebot.com/whatsapp.php?phone=${auntyPhone}&text=${encodedMsg}&apikey=${callmebotApiKey}`;
        
        // Asynchronous non-blocking call
        fetch(whatsappUrl).catch(e => console.error('Failed to trigger CallMeBot Order Alert:', e));
      } catch (waError) {
        console.error('Error preparing WhatsApp Order Alert:', waError);
      }
    }

    return NextResponse.json({ message: 'Order created successfully', orderId: order.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
