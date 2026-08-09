'use client';
import { useSession } from 'next-auth/react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL = 'https://wa.me/9779803568924';
const INSTAGRAM_URL = 'https://www.instagram.com/kickoff45store?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';

function InstagramIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

export default function FloatingSocialButtons() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role === 'admin') return null;

  return (
    <div className="fixed right-4 bottom-24 z-50 flex flex-col gap-3">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit Instagram"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg shadow-black/30 transition hover:scale-110"
      >
        <InstagramIcon />
      </a>
    </div>
  );
}