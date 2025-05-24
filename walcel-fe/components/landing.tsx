"use client";

import { Button } from "@/components/ui/button";
import { Globe, UploadCloud, ShieldCheck } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 text-white">
      {/* 🌐 Hero Section */}
      <div className="text-center max-w-3xl mb-12">
        <h1
          className="text-4xl font-extrabold md:text-5xl bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Deploy Decentralized Websites with dWeb
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Build censorship-resistant websites powered by **IPFS** & **ENS**.
          Deploy easily and access your website via **.eth** domains.
        </p>
      </div>

      {/* 🌟 Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-5xl">
        <FeatureCard
          icon={<Globe className="w-10 h-10 text-blue-400 mx-auto"/>}
          title="Decentralized Hosting"
          description="Your website is stored on IPFS, ensuring global access with no central authority."
        />
        <FeatureCard
          icon={<UploadCloud className="w-10 h-10 text-purple-400 mx-auto"/>}
          title="Easy Deployment"
          description="Deploy your site directly from GitHub with automated builds and hosting."
        />
        <FeatureCard
          icon={<ShieldCheck className="w-10 h-10 text-green-400 mx-auto"/>}
          title="Own Your Domain"
          description="Use ENS domains to make your website easily accessible (e.g., yourname.eth)."
        />
      </div>

      <div className="mt-12 text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          Get Started with dWeb
        </h2>
        <p className="text-gray-400 text-lg">
          Connect your wallet to deploy your decentralized website.
        </p>
        <ConnectButton.Custom>
          {({openConnectModal}) => (
            <Button onClick={openConnectModal} className="px-6 py-3 text-lg text-white font-bold">
              Connect Wallet
            </Button>
          )}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}

// ✅ Feature Card Component
const FeatureCard = ({icon, title, description}: { icon: JSX.Element; title: string; description: string }) => (
  <div className="flex flex-col items-center bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
    {icon}
    <h3 className="text-lg font-semibold mt-3">{title}</h3>
    <p className="text-gray-400 text-sm mt-2">{description}</p>
  </div>
);