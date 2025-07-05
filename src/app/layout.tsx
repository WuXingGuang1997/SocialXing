import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SessionProvider from "@/components/providers/session-provider";
import Header from "@/components/layout/header";
import { Profile } from '@/types';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialXing",
  description: "Un social network costruito con Next.js e Supabase.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  let profile: Profile | null = null;
  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="it" className="dark">
      <body className={inter.className}>
        <SessionProvider serverSession={session}>
          <div className="flex flex-col min-h-screen">
            <Header profile={profile} />
            <main className="flex-1 pt-16">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
