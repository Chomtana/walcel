"use client";

import { fileSrvUrl } from "@/hooks/useFileSrv";
import { useCallback, useEffect, useRef, useState } from "react";
import ProjectList, { Project } from "@/components/project";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function Deployments() {
  const [projects, setProjects] = useState<Project[]>([]);
  const projectsRef = useRef<Project[]>([]);

  const account = useCurrentAccount();

  const getAllProjects = async (address: string) => {
    try {
      const apiUrl = `${fileSrvUrl}/files/project/address/${address}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (err) {
      console.error("Error fetching all projects:", err);
    }
  };

  const fetchProjects = useCallback(async () => {
    if (!account?.address) return;

    try {
      const data = await getAllProjects(account.address);
      if (data) {
        const newProjects = data.map(
          (d: {
            id: string;
            githubUrl: string;
            githubBranch: string;
            deployments: { commitHash: string; status: string }[];
          }) => ({
            id: d.id,
            projectName: d.githubUrl.replace("https://github.com/", ""),
            githubRepo: d.githubUrl,
            branch: d.githubBranch,
            status: d.deployments[0]?.status || "unknown",
            commitHash: d.deployments[0]?.commitHash || "N/A",
          })
        );

        if (
          JSON.stringify(projectsRef.current) !== JSON.stringify(newProjects)
        ) {
          setProjects(newProjects);
          projectsRef.current = newProjects;
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [account?.address]);

  useEffect(() => {
    fetchProjects().catch(console.error);
  }, [fetchProjects]);

  useEffect(() => {
    const interval = setInterval(fetchProjects, 10000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  return (
    <div className="flex flex-col w-full">
      <h1 className="text-3xl font-semibold mb-10">Deployments</h1>
      <ProjectList projects={projects} />
    </div>
  );
}
