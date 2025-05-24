"use client";

import { useAccount } from "wagmi";
import { fileSrvUrl } from "@/hooks/useFileSrv";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Github, GitMerge } from "lucide-react";
import { resolverUrl } from "@/lib/utils";

type EnsData = {
  id: string;
  projectName: string;
  ensName: string;
  githubUrl: string;
  githubBranch: string;
};

export default function EnsDomains() {
  const [ensData, setEnsData] = useState<EnsData[]>([]);
  const { address } = useAccount();
  const getPublishedProjects = async (address: string) => {
    try {
      const apiUrl = `${fileSrvUrl}/files/project/ens/${address}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (err) {
      console.error("Error fetching published projects:", err);
    }
  };

  // useEffect(() => {
  //   if (address) {
  //     getPublishedProjects(address).then((data) => {
  //       const ensData = data.map(
  //         (d: {
  //           id: string;
  //           ensName: string;
  //           githubUrl: string;
  //           githubBranch: string;
  //         }) => {
  //           return {
  //             id: d.id,
  //             projectName: d.githubUrl.split("/").pop(),
  //             ensName: d.ensName,
  //             githubUrl: d.githubUrl,
  //             githubBranch: d.githubBranch,
  //           };
  //         }
  //       );
  //       setEnsData(ensData);
  //     });
  //   }
  // }, [address]);

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-3xl font-semibold mb-10">ENS Domains</h1>
      {ensData.length > 0 ? (
        <div className="flex flex-col w-full">
          {ensData.map((project) => (
            <div
              key={project.id}
              className="flex flex-col p-4 border-b border-gray-200 rounded-md gap-4 mb-6"
            >
              <div className="flex flex-row justify-between items-center">
                <Label className="font-semibold text-xl">
                  {project.projectName}
                </Label>
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(resolverUrl(project.ensName, false), "_blank")
                  }
                >
                  {project.ensName} <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-row justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => window.open(project.githubUrl, "_blank")}
                >
                  <Github className="w-4 h-4" />{" "}
                  {project.githubUrl.replace("https://github.com/", "")}
                </Button>
                <div className="flex flex-row items-center gap-2">
                  <GitMerge className="w-4 h-4" />
                  <Label className="text-sm italic">
                    {project.githubBranch}
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <Label className="font-bold italic">
            You have not published any projects to ENS yet.
          </Label>
        </div>
      )}
    </div>
  );
}
