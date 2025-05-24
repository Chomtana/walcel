"use client";

import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import LandingPage from "@/components/landing";

export default function DashboardLayout({
  children,
  ensdomains,
  deployments,
}: {
  children: React.ReactNode;
  ensdomains: React.ReactNode;
  deployments: React.ReactNode;
}) {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();

  if (!isConnected || !address) {
    return <LandingPage />;
  }

  // Exclude layout for dynamic project pages (/[projectId])
  if (pathname.match(/^\/[^\/]+$/)) {
    return (
      <div className="flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-screen-md">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 md:p-8">
      <div className="flex justify-end mb-4">{children}</div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-12">
        {/* <div className="w-full md:w-1/3">{ensdomains}</div> */}
        <div className="w-full md:w-2/3">{deployments}</div>
      </div>
    </div>
  );
}
