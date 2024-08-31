"use client";

import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionObjBack } from "@/types";
import { calculateTotalTypeTrans } from "../../utils/calculate-total-type-trans";
import { getEllipsed } from "@/utils/const";
import { differenceInCalendarDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useCurrency } from "@/hooks/use-currency";
import { formatAmount } from "@/utils/format-amount";

type Props = {
  filteredData: TransactionObjBack[] | undefined;
  isLoading: boolean;
  dateBlock: DateRange | undefined;
};

export const KpiBlock = ({ filteredData, isLoading, dateBlock }: Props) => {
  const { currency } = useCurrency();

  const incomes = filteredData
    ? calculateTotalTypeTrans({ transactions: filteredData })
    : 0;
  const expenses = filteredData
    ? calculateTotalTypeTrans({
        transactions: filteredData,
        transType: "expenses",
      })
    : 0;
  const incomeTransactions = (filteredData ?? []).filter(
    (transaction) => transaction.amount >= 0,
  );
  const expenseTransactions = (filteredData ?? []).filter(
    (transaction) => transaction.amount < 0,
  );

  const netSavings = incomes + expenses;
  const netSavingSymbol = netSavings > 0 ? "+" : "";
  const daysBetweenDates =
    dateBlock?.from && dateBlock?.to
      ? differenceInCalendarDays(dateBlock.to, dateBlock.from)
      : 0;
  const moneyPerDay = netSavings / daysBetweenDates;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className={`text-sm font-medium ${getEllipsed}`}>
            Incomes in this period
          </CardTitle>
          <Icons.incomes className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="w-full h-6 my-1" />
              <Skeleton className="w-full h-4 my-1" />
            </>
          ) : filteredData && filteredData.length > 0 ? (
            <>
              <div className="text-2xl font-bold text-green-600">
                +{currency}
                {formatAmount(incomes)}
              </div>
              <p className={`text-xs text-muted-foreground ${getEllipsed}`}>
                <span className="font-bold">{incomeTransactions.length} </span>
                income transactions
              </p>
            </>
          ) : (
            <div className={`text-lg font-semibold ${getEllipsed}`}>
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className={`text-sm font-medium ${getEllipsed}`}>
            Expenses in this period
          </CardTitle>
          <Icons.expenses className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="w-full h-6 my-1" />
              <Skeleton className="w-full h-4 my-1" />
            </>
          ) : filteredData && filteredData.length > 0 ? (
            <>
              <div className="text-2xl font-bold text-red-700">
                -{currency}
                {formatAmount(Math.abs(expenses))}
              </div>
              <p className={`text-xs text-muted-foreground ${getEllipsed}`}>
                <span className="font-bold">{expenseTransactions.length} </span>
                expense transactions
              </p>
            </>
          ) : (
            <div className={`text-lg font-semibold ${getEllipsed}`}>
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className={`text-sm font-medium ${getEllipsed}`}>
            Net saving in this period
          </CardTitle>
          <Icons.netSavings className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="w-full h-6 my-1" />
              <Skeleton className="w-full h-4 my-1" />
            </>
          ) : filteredData && filteredData.length > 0 ? (
            <>
              <div
                className={`text-2xl font-bold ${
                  netSavings >= 0 ? "text-green-600" : "text-red-700"
                }`}
              >
                {netSavingSymbol}
                {currency}
                {formatAmount(netSavings)}
              </div>
              <p className={`text-xs text-muted-foreground ${getEllipsed}`}>
                <span className="font-bold">
                  {netSavingSymbol}
                  {formatAmount(moneyPerDay)}{" "}
                </span>
                per day (in {daysBetweenDates} days)
              </p>
            </>
          ) : (
            <div className={`text-lg font-semibold ${getEllipsed}`}>
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className={`text-sm font-medium ${getEllipsed}`}>
            Transactions in this period
          </CardTitle>
          <Icons.transactions className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <>
              <Skeleton className="w-full h-6 my-1" />
              <Skeleton className="w-full h-4 my-1" />
            </>
          ) : filteredData && filteredData.length > 0 ? (
            <>
              <div className="text-2xl font-bold">
                {formatAmount(filteredData.length)}
              </div>
              <p className={`text-xs text-muted-foreground ${getEllipsed}`}>
                <span className="font-bold">
                  {incomes >= Math.abs(expenses)
                    ? formatAmount(
                        (incomeTransactions.length * 100) / filteredData.length,
                      )
                    : formatAmount(
                        (expenseTransactions.length * 100) /
                          filteredData.length,
                      )}
                  %
                </span>{" "}
                are {incomes >= Math.abs(expenses) ? "income" : "expense"}{" "}
                transactions
                {incomes > expenses}
              </p>
            </>
          ) : (
            <div className={`text-lg font-semibold ${getEllipsed}`}>
              No transactions found
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
