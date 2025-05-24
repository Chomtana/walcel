"use client";

import { fileSrvUrl } from "@/hooks/useFileSrv";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CircleCheck,
  CircleDotDashed,
  CircleX,
  Github,
  GitMerge,
  RotateCcw,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import EnvManager, { EnvVar } from "@/components/envmanager";
import { useAccount, useSignMessage } from "wagmi";
import { Input } from "@/components/ui/input";
import { AddEnsDialog } from "@/components/add-ens-dialog";
import { deploySrvUrl } from "@/hooks/useDeploySrv";
import { resolverUrl } from "@/lib/utils";

type ProjectInfo = {
  githubUrl: string;
  githubBranch: string;
  address: string;
  ensName?: string;
  envJson?: string;
};

type Deployment = {
  id: number;
  commitHash?: string;
  commitTitle?: string;
  ipfsCid?: string;
  status: string;
  deployedAt: string;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const diff = Math.floor(diffInSeconds / seconds);
    if (diff >= 1) {
      return rtf.format(-diff, unit as Intl.RelativeTimeFormatUnit);
    }
  }

  return "Just now";
}

export default function ProjectDetails({ projectId }: { projectId: string }) {
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: "", value: "" }]);
  const [outputDir, setOutputDir] = useState("dist");

  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const getProject = async (projectId: string) => {
    try {
      const apiUrl = `${fileSrvUrl}/files/project/${projectId}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (err) {
      console.error("Error fetching project:", err);
    }
  };

  const fetchProjectData = async () => {
    if (isConnected && projectId) {
      const data = await getProject(projectId);
      if (data) {
        const projectInfo: ProjectInfo = {
          githubUrl: data.githubUrl,
          githubBranch: data.githubBranch,
          address: data.address,
          ensName: data.ensName,
          envJson: data.environment?.jsonText,
        };
        const deployment: Deployment = {
          id: data.deployments[0].id,
          commitHash: data.deployments[0].commitHash,
          commitTitle: data.deployments[0].commitTitle,
          ipfsCid: data.deployments[0].ipfsCid,
          status: data.deployments[0].status,
          deployedAt: data.deployments[0].createdAt,
        };
        const outputDir = data.buildConfig?.outputDir ?? "dist";
        const envVars: EnvVar[] = projectInfo.envJson
          ? JSON.parse(projectInfo.envJson)
          : [{ key: "", value: "" }];

        setProjectInfo(projectInfo);
        setDeployment(deployment);
        setEnvVars(envVars);
        setOutputDir(outputDir);
      }
    }
  };

  const handleReDeploy = async () => {
    try {
      const message = `Re-deploy ${projectInfo?.githubUrl} at ${Date.now()}`;
      // const signature = await signMessageAsync({ message });
      const apiUrl = `${deploySrvUrl}/deploy/redeploy`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: projectId,
          envJson: JSON.stringify(envVars),
          address: address,
          message: message,
          signature: "dummy",
        }),
      });
      const data = await response.json();
      console.log("data", data);
      fetchProjectData().catch(console.error);
    } catch (err) {
      console.error("Error re-deploying project:", err);
    }
  };

  useEffect(() => {
    // Fetch data initially
    fetchProjectData().catch(console.error);

    // Polling interval (e.g., every 10 seconds)
    const interval = setInterval(() => {
      fetchProjectData().catch(console.error);
    }, 10000); // 10 seconds interval

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [isConnected, projectId]);

  if (!projectInfo || !deployment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full space-y-8 md:px-24">
      <div className="flex flex-col space-y-8 w-full md:mx-auto">
        <div className="flex flex-row items-center justify-between mb-10">
          <Label className="font-bold text-3xl">
            {projectInfo.githubUrl.split("/").pop()}
          </Label>
          <Button variant="secondary" onClick={handleReDeploy}>
            <RotateCcw className="w-4 h-4" /> Re-Deploy
          </Button>
        </div>
        <div className="flex flex-row md:space-x-20 space-x-5">
          <div className={"flex flex-col space-y-2"}>
            <Label className="font-semibold">Status</Label>
            {deployment.status === "ready" ||
            deployment.status === "deployed" ? (
              <div className="flex items-center gap-2">
                <CircleCheck className="w-4 h-4 text-green-500" />{" "}
                <span>{deployment.status}</span>
              </div>
            ) : deployment.status === "failed" ? (
              <div className="flex items-center gap-2">
                <CircleX className="w-4 h-4 text-red-500" />{" "}
                <span>{deployment.status}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CircleDotDashed className="w-4 h-4 text-yellow-500" />{" "}
                <span>{deployment.status}</span>
              </div>
            )}
          </div>
          <div className={"flex flex-col space-y-2"}>
            <Label className="font-semibold">Deployed At</Label>
            <p>
              {deployment.deployedAt
                ? timeAgo(deployment.deployedAt)
                : "Pending"}
            </p>
          </div>
          {/* <div className={"flex flex-col space-y-2"}>
            <Label className="font-semibold">Deployed By</Label>
            <p>{shortenAddress(projectInfo.address)}</p>
          </div> */}
        </div>
        <div className="flex flex-col space-y-4">
          <Label className="font-semibold">Site Object ID</Label>
          <Input
            id="ipfs_cid"
            disabled={true}
            value={deployment.ipfsCid ?? "Pending"}
          />
        </div>
        <div className="flex flex-col space-y-4">
          <Label className="font-semibold">SuiNS Domain</Label>
          <div>
            {projectInfo.ensName ? (
              <div className={"flex items-center gap-2"}>
                <Button
                  variant="secondary"
                  onClick={() =>
                    window.open(
                      resolverUrl(projectInfo.ensName!, false),
                      "_blank"
                    )
                  }
                >
                  {projectInfo.ensName} <ArrowUpRight className="w-4 h-4" />
                </Button>
                <AddEnsDialog
                  ipfsCid={deployment.ipfsCid}
                  address={projectInfo.address}
                  projectId={projectId}
                  deployId={deployment.id}
                  disabled={!deployment.ipfsCid}
                  isUpdateEns={true}
                />
              </div>
            ) : (
              <AddEnsDialog
                ipfsCid={deployment.ipfsCid}
                address={projectInfo.address}
                projectId={projectId}
                deployId={deployment.id}
                disabled={!deployment.ipfsCid}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <Label className="font-semibold">Source</Label>
          <div>
            <Button
              variant="secondary"
              className="mr-2 flex items-center gap-2"
              onClick={() => window.open(projectInfo.githubUrl, "_blank")}
            >
              <Github className="w-4 h-4" />{" "}
              {projectInfo.githubUrl.replace("https://github.com/", "")}
            </Button>
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4" />
              <span className="italic">{projectInfo.githubBranch}</span>
            </div>
            {deployment.commitTitle && (
              <Label className="italic">
                {deployment.commitHash &&
                  `(${deployment.commitHash.slice(0, 6)})`}{" "}
                {deployment.commitTitle}
              </Label>
            )}
          </div>
        </div>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="build-settings">
          <AccordionTrigger className="font-bold">
            Build Settings
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-4">
              <div className="grid w-full items-center gap-2">
                <Label className="font-bold">Output Directory</Label>
                <Input
                  id="root_dir"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="envrionment-variables">
          <AccordionTrigger className="font-bold">
            Environment Variables
          </AccordionTrigger>
          <AccordionContent>
            <EnvManager envVars={envVars} setEnvVars={setEnvVars} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
