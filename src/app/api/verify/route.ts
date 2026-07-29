import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } });

    if (!customer || !customer.verificationCode || !customer.verificationCodeExpiry) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (customer.verificationCode !== code) {
      return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
    }

    if (new Date() > customer.verificationCodeExpiry) {
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
    }

    await prisma.customer.update({
      where: { email: normalizedEmail },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}