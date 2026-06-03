import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAuntyNotification } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, phone, jarCount, notes } = body;

    if (!customerName || !phone || !jarCount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const count = parseInt(jarCount, 10);
    if (isNaN(count) || count < 5) {
      return NextResponse.json({ message: 'Minimum 5 jars are required for return program' }, { status: 400 });
    }

    // Generate discount code: JAR-[phone-last4]-[random4]
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const last4 = cleanPhone.substring(Math.max(0, cleanPhone.length - 4)) || '0000';
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    const discountCode = `JAR-${last4}-${random4}`;

    const jarReturn = await prisma.jarReturn.create({
      data: {
        id: discountCode, // Store generated code in the ID field
        customerName,
        phone,
        jarCount: count,
        discountApplied: false
      }
    });

    // Notify Aunty
    const message = `♻️ Jar Return Request: ${customerName} wants to return ${count} jars. Phone: ${phone}. Code generated: ${discountCode}. Notes: ${notes || 'None'}`;
    await sendAuntyNotification(message);

    return NextResponse.json({ 
      message: 'Jar return request registered successfully', 
      jarReturn, 
      discountCode 
    }, { status: 201 });

  } catch (error) {
    console.error('Error handling jar return:', error);
    return NextResponse.json({ message: 'Failed to submit jar return' }, { status: 500 });
  }
}
