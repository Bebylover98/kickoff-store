import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email).trim().toLowerCase();

    const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } });
    if (!customer) {
      return NextResponse.json({ error: "No account found" }, { status: 400 });
    }
    if (customer.emailVerified) {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.customer.update({
      where: { email: normalizedEmail },
      data: { verificationCode: code, verificationCodeExpiry: expiry },
    });

    await resend.emails.send({
      from: "KickoffStore <onboarding@resend.dev>",
      to: normalizedEmail,
      subject: "Your new verification code — KickoffStore",
      html: `<p>Your new code is: <b>${code}</b></p><p>This code expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ message: "Code resent" });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}