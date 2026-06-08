import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { z } from 'zod';
import { applyRateLimit } from '@/lib/rateLimit';

const discountValidateSchema = z.object({
  code: z.string().min(1, 'Discount code is required'),
  phone: z.string().optional()
});

export async function POST(req: Request) {
  // Rate limiting: 30 validations per hour per IP
  const limitRes = await applyRateLimit('discount-validate', 30, 60 * 60 * 1000);
  if (limitRes) return limitRes;

  try {
    const body = await req.json();
    const result = discountValidateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ valid: false, message: result.error.issues[0].message }, { status: 400 });
    }

    const { code, phone } = result.data;

    const uppercaseCode = code.toUpperCase().trim();

    if (uppercaseCode.startsWith('JAR-')) {
      const jarReturn = await prisma.jarReturn.findUnique({
        where: { id: uppercaseCode },
      });

      if (!jarReturn) {
        return NextResponse.json({ valid: false, message: 'Invalid jar return code' }, { status: 200 });
      }

      if (jarReturn.discountApplied) {
        return NextResponse.json({ valid: false, message: 'This jar return code has already been used' }, { status: 200 });
      }

      return NextResponse.json({
        valid: true,
        code: uppercaseCode,
        discountType: 'percentage',
        discountValue: 0.10, // 10%
        message: 'Jar return 10% discount applied!'
      }, { status: 200 });

    } else if (uppercaseCode.startsWith('REF-')) {
      const referral = await prisma.referral.findUnique({
        where: { referralCode: uppercaseCode },
      });

      if (!referral) {
        return NextResponse.json({ valid: false, message: 'Invalid referral code' }, { status: 200 });
      }

      if (referral.isUsed) {
        return NextResponse.json({ valid: false, message: 'This referral code has already been used' }, { status: 200 });
      }

      if (phone && referral.referrerPhone === phone.replace(/[^0-9]/g, '')) {
        return NextResponse.json({ valid: false, message: 'You cannot use your own referral code' }, { status: 200 });
      }

      return NextResponse.json({
        valid: true,
        code: uppercaseCode,
        discountType: 'flat',
        discountValue: 100, // ₹100
        message: 'Referral discount of ₹100 applied!'
      }, { status: 200 });
    }

    return NextResponse.json({ valid: false, message: 'Invalid code format. Codes must start with JAR- or REF-' }, { status: 200 });

  } catch (error) {
    console.error('Error validating discount code:', error);
    return NextResponse.json({ message: 'Internal server error during validation' }, { status: 500 });
  }
}
