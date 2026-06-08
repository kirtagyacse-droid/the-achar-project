import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAuntyNotification } from '@/lib/whatsapp';
import { z } from 'zod';
import { applyRateLimit } from '@/lib/rateLimit';

const jarReturnSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(10, 'Invalid phone number'),
  jarCount: z.union([z.number(), z.string()]).transform((val) => {
    const parsed = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(parsed)) throw new Error('Invalid jar count');
    return parsed;
  }),
  notes: z.string().optional()
});

export async function POST(req: Request) {
  // Rate limiting: 10 requests per hour per IP
  const limitRes = await applyRateLimit('jar-return', 10, 60 * 60 * 1000);
  if (limitRes) return limitRes;

  try {
    const body = await req.json();
    const result = jarReturnSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { customerName, phone, jarCount, notes } = result.data;
    const count = jarCount;
    if (count < 5) {
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
