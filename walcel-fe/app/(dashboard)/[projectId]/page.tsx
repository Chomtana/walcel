import ProjectDetails from "@/components/project-details";

export default async function DetailProject({params}: { params: Promise<{ projectId: string }>; }) {
  const projectId = (await params).projectId;
  return <ProjectDetails projectId={projectId}/>
}