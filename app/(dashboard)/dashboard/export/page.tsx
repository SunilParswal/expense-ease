import BreadCrumb from "@/components/breadcrumb";
import { Export } from "@/components/export/export";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { authOptions } from "@/lib/auth-options";
import { CustomSessionI } from "@/types";
import { getServerSession, NextAuthOptions } from "next-auth";
import { useEffect, useState } from "react";

const breadcrumbItems = [{ title: "Export", link: "/dashboard/export" }];

type ParamsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

export default async function Exports({ searchParams }: ParamsProps) {
  const session = await getServerSession(
    authOptions as unknown as NextAuthOptions,
  );

  const { viewport } = searchParams;
  return (
    <div className="flex-1 p-4 pt-6 space-y-2 sm:space-y-4 md:p-8">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex items-start justify-between">
        <Heading
          maxWidthClass="max-w-[calc(100%-175px)]"
          title="Export Data"
          description="Export your data in CSV or PDF form"
        />
      </div>
      <Separator />
      <Export session={session} viewport={viewport} />
    </div>
  );
}
