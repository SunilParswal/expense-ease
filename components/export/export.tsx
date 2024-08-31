"use client";

import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { format, subYears } from "date-fns";
import { URL_POST_TRANSACTION, dateFormat, errorMessages } from "@/utils/const";
import { useFetch } from "@/hooks/use-fetch";
import type { CustomUser, TransactionObjBack } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "../ui/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BarChartBlock } from "../dashboard/components/charts/bar-chart";
import { aggregateTransactionsByMonth } from "../dashboard/utils/aggregate-transactions-by-month";
import { LineChartBlock } from "../dashboard/components/charts/line-chart";
import { aggregateTransactionsByDay } from "../dashboard/utils/aggregate-transactions-by-day";
import { PieChartBlock } from "../dashboard/components/charts/pie-chart";
import { aggregateTransactionsPerCategories } from "../dashboard/utils/aggregate-transactions-per-categories";
import {
  EXPENSES_CHART_COLOR,
  INCOMES_CHART_COLOR,
} from "../dashboard/utils/const";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { FileText, FileType2 } from "lucide-react";
import { FilteredTransactionsSchema } from "@/schemas/filtered-transactions-schema";
import {
  getAllTransactionsPerUser,
  getFilteredTransactions,
} from "@/services/transactions";
import { parseZodErrors } from "@/utils/parse-zod-errors";
import { z } from "zod";
import { generateCSV } from "../dashboard/utils/generate-csv";

type Props = {
  session: Session | null;
  viewport: string | undefined;
};

type ResponseFilteredData = {
  ok: boolean;
  data?: { list: TransactionObjBack[]; totalCount: number };
  error?: string;
};

export const Export = ({ session, viewport }: Props) => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [show, setShow] = useState(false);
  const { fetchPetition } = useFetch();
  const { toast } = useToast();
  const pdfIframeRef = useRef<HTMLIFrameElement | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [isCsvVisible, setIsCsvVisible] = useState<boolean>(false);

  const fetchFilteredTransactions = async ({ queryKey }: { queryKey: any }) => {
    const [keyPath, { startDate, endDate }] = queryKey;
    const URL = `${keyPath}?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetchPetition<ResponseFilteredData>({
      url: URL,
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(response.error ?? "Network response was not ok");
    }
    return response.data?.list;
  };

  const {
    data: filteredData,
    error,
    isLoading,
  } = useQuery({
    queryKey: [
      URL_POST_TRANSACTION,
      {
        startDate: format(date?.from ?? new Date(), dateFormat.ISO),
        endDate: format(date?.to ?? new Date(), dateFormat.ISO),
      },
    ],
    queryFn: fetchFilteredTransactions,
    enabled: !!date?.from && !!date?.to,
  });

  useEffect(() => {
    const localStorageDates = localStorage.getItem("expenses-dashboard-dates");
    if (localStorageDates) {
      const parsedStoredDates = JSON.parse(localStorageDates);
      setDate({
        from: new Date(parsedStoredDates.from),
        to: new Date(),
      });
    } else {
      setDate({
        from: subYears(new Date(), 1),
        to: new Date(),
      });
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (error && !isLoading) {
      toast({
        title: "There has been an error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, isLoading]);

  const onSetDate = (dateRange: DateRange | undefined) => {
    setDate(dateRange);
    if (dateRange?.from && dateRange?.to) {
      const from = format(new Date(dateRange.from), dateFormat.ISO);
      const to = format(new Date(dateRange.to), dateFormat.ISO);
      localStorage.setItem(
        "expenses-dashboard-dates",
        JSON.stringify({ from, to }),
      );
    }
  };
  let pdf = undefined;

  const generatePDF = async () => {
    if (!pdfContainerRef.current) return;

    // Convert the PDF container to a canvas
    const canvas = await html2canvas(pdfContainerRef.current);
    const imgData = canvas.toDataURL("image/png");

    // Create a new jsPDF instance
    pdf = new jsPDF("p", "mm", "a3");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Get the PDF as a blob and set it to the iframe source
    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (pdfIframeRef.current) {
      pdfIframeRef.current.src = pdfUrl;
    }

    // Optionally, save the PDF file
    pdf.save("transactions_report.pdf");
  };

  const showPDF = async () => {
    if (!pdfContainerRef.current) return;

    // Convert the PDF container to a canvas
    const canvas = await html2canvas(pdfContainerRef.current);
    const imgData = canvas.toDataURL("image/png");

    // Create a new jsPDF instance
    pdf = new jsPDF("p", "mm", "a3");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    if (pdfIframeRef.current) {
      pdfIframeRef.current.src = pdfUrl;
    }

    setShow(true);
  };

  const barChartData = aggregateTransactionsByMonth(filteredData ?? []);

  const lineChartData = aggregateTransactionsByDay(filteredData ?? []);

  const incomes = (filteredData ?? []).filter((trans) => trans.amount >= 0);

  const expenses = (filteredData ?? []).filter((trans) => trans.amount < 0);

  const parseCSV = (csvString: string) => {
    const lines = csvString.split("\n");
    const headers = lines[0];
    const data = lines.slice(1);
    return { headers, data };
  };

  const combineCSV = (csv1: string, csv2: string) => {
    const { headers: headers1, data: data1 } = parseCSV(csv1);
    const { headers: headers2, data: data2 } = parseCSV(csv2);

    // Create a unique header from the first CSV headers
    const combinedHeaders = headers1;

    // Combine data, skipping the header of the second CSV
    const combinedData = [...data1, ...data2].join("\n");

    return `${combinedHeaders}\n${combinedData}`;
  };

  const downloadCSV = (csvData: string, fileName: string) => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = () => {
    const fullData1 = generateCSV(incomes, "Income"); // Replace with actual function
    const fullData2 = generateCSV(expenses, "Expense"); // Replace with actual function
    const combinedCSV = combineCSV(fullData1, fullData2);
    downloadCSV(combinedCSV, "transaction-report.csv");
  };

  const handleShowCSV = () => {
    const fullData1 = generateCSV(incomes, "Income"); // Replace with actual function
    const fullData2 = generateCSV(expenses, "Expense"); // Replace with actual function
    const combinedCSV = combineCSV(fullData1, fullData2);
    setCsvContent(combinedCSV);
    setIsCsvVisible(true);
  };

  const handleHideCSV = () => {
    setIsCsvVisible(false);
  };

  const expensesPerCategories = aggregateTransactionsPerCategories({
    transactions: expenses,
  });

  const incomesPerCategories = aggregateTransactionsPerCategories({
    transactions: incomes,
  });

  const fromDate = date?.from
    ? format(date.from, "MM/dd/yyyy")
    : format(new Date(), "MM/dd/yyyy");
  const toDate = date?.to
    ? format(date.to, "MM/dd/yyyy")
    : format(new Date(), "MM/dd/yyyy");

  return (
    <div className="flex md:flex-row flex-col gap-5 items-center justify-center">
      <Dialog>
        <DialogTrigger>
          <div className="flex flex-row gap-2 items-center justify-center border rounded-md p-3">
            <FileType2 size={20} />
            Generate CSV
          </div>
        </DialogTrigger>
        <DialogContent className="w-[80%] h-[80%] max-w-[80%] max-h-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download your CSV Report</DialogTitle>
            <DialogDescription>
              <div className="p-4 pt-6 space-y-4 md:p-8">
                <div className="items-center flex flex-row justify-between">
                  <div className="flex flex-row gap-5">
                    <Button
                      onClick={handleDownload}
                      className="bg-blue-500 text-white py-2 px-4 rounded-md"
                    >
                      Download CSV
                    </Button>
                    <Button
                      onClick={handleShowCSV}
                      className="bg-blue-500 text-white py-2 px-4 rounded-md"
                    >
                      Show CSV
                    </Button>
                  </div>
                  <CalendarDateRangePicker
                    viewport={viewport}
                    date={date}
                    setDate={onSetDate}
                  />
                </div>
                {isCsvVisible ? (
                  <div className="w-full h-[500px] border">
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        margin: "10px",
                      }}
                    >
                      {csvContent}
                    </pre>
                  </div>
                ) : (
                  <h1 className="flex h-[500px] mt-4 text-white border items-center justify-center">
                    Click on show CSV
                  </h1>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger>
          <div className="flex flex-row gap-2 items-center justify-center border rounded-md p-3">
            <FileText size={20} />
            Generate PDF
          </div>
        </DialogTrigger>
        <DialogContent className="w-[80%] h-[80%] max-w-[80%] max-h-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download your PDF Report</DialogTitle>
            <DialogDescription>
              <div className="p-4 pt-6 space-y-4 md:p-8">
                <div className="items-center flex flex-row justify-between">
                  <CalendarDateRangePicker
                    viewport={viewport}
                    date={date}
                    setDate={onSetDate}
                  />
                  <div className="flex flex-row gap-5">
                    <Button
                      onClick={generatePDF}
                      className="bg-blue-500 text-white py-2 px-4 rounded-md"
                    >
                      Download PDF
                    </Button>
                    <Button
                      onClick={showPDF}
                      className="bg-blue-500 text-white py-2 px-4 rounded-md"
                    >
                      Show PDF
                    </Button>
                  </div>
                </div>

                {show ? (
                  <iframe
                    ref={pdfIframeRef}
                    title="PDF Preview"
                    className="w-full h-[500px] mt-4 border"
                  />
                ) : (
                  <h1 className="flex h-[500px] mt-4 text-white border items-center justify-center">
                    Click on show PDF
                  </h1>
                )}
                {/* The content to be captured for the PDF */}
                <div ref={pdfContainerRef}>
                  <Card className="mb-10">
                    <div className="flex flex-row justify-evenly">
                      <div className="flex flex-row gap-2">
                        <Image
                          src={session?.user?.image || "public/user.jpg"}
                          alt={session?.user?.name || "User Image"}
                          className="rounded-full w-[300px] h-[300px]"
                          width={300}
                          height={300}
                        />
                      </div>
                      <div className="flex flex-col gap-3 justify-center">
                        <div className="flex flex-row gap-2">
                          <h1 className="font-semibold">Name:</h1>
                          <h1>{session?.user?.name}</h1>
                        </div>
                        <div className="flex flex-row gap-2">
                          <h1 className="font-semibold">Email:</h1>
                          <h1>{session?.user?.email}</h1>
                        </div>
                        <div className="flex flex-row gap-2">
                          <h1 className="font-semibold">Date Range:</h1>
                          <h1>{`${fromDate} - ${toDate}`}</h1>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
                    <Card className="relative col-span-4">
                      <CardHeader>
                        <CardTitle>Monthly Expense</CardTitle>
                      </CardHeader>
                      <CardContent className="pl-0 h-[400px]">
                        <BarChartBlock data={barChartData} />
                      </CardContent>
                    </Card>
                    <Card className="relative col-span-4">
                      <CardHeader>
                        <CardTitle>Daily Expense</CardTitle>
                      </CardHeader>
                      <CardContent className="pl-0 h-[400px]">
                        <LineChartBlock data={lineChartData} />
                      </CardContent>
                    </Card>
                    <Card className="relative col-span-4 xl:col-span-3 ">
                      <CardHeader>
                        <CardTitle>All Incomes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChartBlock
                          data={expensesPerCategories}
                          pieColor={EXPENSES_CHART_COLOR}
                        />
                      </CardContent>
                    </Card>
                    <Card className="relative col-span-4 xl:col-span-3">
                      <CardHeader>
                        <CardTitle>All Expenses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChartBlock
                          data={incomesPerCategories}
                          pieColor={INCOMES_CHART_COLOR}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
