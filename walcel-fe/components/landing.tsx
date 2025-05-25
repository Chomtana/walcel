"use client";

import { Button } from "@/components/ui/button";
import { Globe, UploadCloud, ShieldCheck } from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";

export default function LandingPage() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-white"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      {/* 🌐 Hero Section */}
      <div className="text-center max-w-3xl mb-4">
        <h1 className="text-6xl font-extrabold md:text-5xl bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Walcel
        </h1>
        <p className="mt-4 text-2xl text-gray-300">Vercel for Walrus</p>
      </div>

      <div className="mt-4 text-center space-y-4">
        <p className="text-gray-400 text-lg">
          Connect your wallet to deploy your Walrus Site.
        </p>
        <ConnectButton />
      </div>
    </div>
  );
}

// ✅ Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
    {icon}
    <h3 className="text-lg font-semibold mt-3">{title}</h3>
    <p className="text-gray-400 text-sm mt-2">{description}</p>
  </div>
);
