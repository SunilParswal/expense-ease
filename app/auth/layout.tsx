import type { Metadata } from "next";
import Image from "next/image";
import { getRandomItem } from "@/utils/get-random-item";
import quotes from "../../public/data/quotes.json";
import authImages from "../../public/data/auth-images.json";

export const metadata: Metadata = {
  title: "Expense Ease - Authentication",
  description: "Signin or signup into Expense Ease",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const quoteItem = getRandomItem(quotes);
  const imagePath = getRandomItem(authImages);

  return (
    <div>
      <div className="flex items-center h-full p-4 lg:p-8">{children}</div>
    </div>
  );
}
