import Providers from "@/components/layout/providers";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "filepond/dist/filepond.min.css";
import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense Ease",
  description:
    "Expense Ease is an intuitive app designed to help you manage your finances effortlessly. Keep track of your incomes, expenses, and subscriptions, analyze your financial habits, and make informed decisions. Featuring a user-friendly dashboard, transaction filtering, bulk CSV uploads, and subscription management.",
  keywords: [
    "Expense Ease",
    "financial management",
    "budgeting",
    "income tracking",
    "expense tracking",
    "subscription management",
  ],
  authors: [{ name: "Sumit", url: "https://www.sumitshandillya.site" }],
  applicationName: "Expense Ease",
  icons: [{ rel: "icon", url: "/images/favicon.ico" }],
  openGraph: {
    type: "website",
    url: "",
    title: "Manage Your Finances with Ease | Expense Ease",
    description:
      "Track your incomes and expenses, manage subscriptions, and get insights into your financial habits with Expense Ease. Start simplifying your financial management today.",
    siteName: "Expense Ease",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manage Your Finances with Ease | Expense Ease",
    description:
      "Track your incomes and expenses, manage subscriptions, and get insights into your financial habits with Expense Ease. Start simplifying your financial management today.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-hidden`}>
        <Providers session={session}>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
