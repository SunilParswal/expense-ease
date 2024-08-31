import { TransactionObjBack } from "@/types";

export const generateCSV = (
  data: TransactionObjBack[],
  type: string,
): string => {
  const header = ["Amount", "Type", "Date", "Category", "Notes"];
  const rows = data.map((user) => [
    user.amount,
    type,
    user.date,
    user.name,
    user.notes,
  ]);
  const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");
  return csvContent;
};
