import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!email || !password || !phone) {
      return NextResponse.json(
        { error: "Email, password, and phone number are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing && existing.emailVerified) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const customer = existing
      ? await prisma.customer.update({
          where: { email: normalizedEmail },
          data: {
            name: name || existing.name,
            phone: phone || existing.phone,
            passwordHash,
            verificationCode: code,
            verificationCodeExpiry: expiry,
          },
        })
      : await prisma.customer.create({
          data: {
            name: name || null,
            email: normalizedEmail,
            phone: phone || null,
            passwordHash,
            provider: "credentials",
            verificationCode: code,
            verificationCodeExpiry: expiry,
          },
        });

    await resend.emails.send({
      from: "KickoffStore <onboarding@resend.dev>", // must be a domain verified in Resend
      to: normalizedEmail,
      subject: "Verify your email — KickoffStore",
      html: `<p>Welcome to KickoffStore!</p><p>Your verification code is: <b>${code}</b></p><p>This code expires in 10 minutes.</p>`,
    });

    return NextResponse.json(
      { message: "Account created. Check your email for the verification code.", id: customer.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
