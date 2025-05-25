import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CircleCheck,
  CircleDotDashed,
  CircleX,
  Github,
  GitMerge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface Project {
  id: string;
  projectName: string;
  githubRepo: string;
  branch: string;
  status: string;
  commitHash: string;
}

type ProjectProps = {
  projects: Project[];
};
export default function ProjectList(props: ProjectProps) {
  const { projects } = props;
  const router = useRouter();

  if (!projects || !projects.length) {
    return (
      <div className="flex items-center justify-center h-30">
        <p className="text-muted-foreground">No deployments found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {projects.map((project, index) => (
        <Card
          key={index}
          className="w-full min-w-1/2 hover:border-blue-100 cursor-pointer"
          onClick={() => router.push(`/${project.id}`)}
        >
          <CardHeader className="flex flex-row justify-between items-center">
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {project.projectName.split("/").pop()}
              </CardTitle>
              <CardDescription>{project.status}</CardDescription>
            </div>
            <div>
              {project.status === "ready" || project.status === "deployed" ? (
                <CircleCheck className="w-10 h-10 text-green-500" />
              ) : project.status === "failed" ? (
                <CircleX className="w-10 h-10 text-red-500" />
              ) : (
                <CircleDotDashed className="w-10 h-10 text-yellow-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              className="mr-2 flex items-center gap-2"
              onClick={() => window.open(project.githubRepo, "_blank")}
            >
              <Github className="w-4 h-4" /> {project.projectName}
            </Button>
            <div className="flex items-center gap-2 mt-2">
              <GitMerge className="w-4 h-4" />
              <p className="italic">{project.branch}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
