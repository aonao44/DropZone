import { DownloadAllButton } from "@/components/DownloadAllButton";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch project data
  const slug = params.slug.trim();
  console.log("Debug: slug = ", slug);

  const { data: project, error } = await supabase.from("projects").select("*").eq("slug", slug).single();

  if (error) {
    console.error("Supabase error (project fetch):", error);
  }
  if (!project) {
    console.warn("No project found for slug:", slug);
    notFound();
  }

  // Fetch submissions data
  const { data: submissions, error: submissionsError } = await supabase
    .from("submissions")
    .select("*")
    .eq("project_slug", params.slug);

  console.log("submissions:", submissions);
  console.log("submissionsError:", submissionsError);

  const hasSubmissions = submissions && submissions.length > 0;
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.title}</h1>

        <div className="flex gap-2">
          {hasSubmissions && <DownloadAllButton project_slug={params.slug} variant="secondary" />}
          {/* Other action buttons */}
        </div>
      </div>

      {/* Rest of your project page content */}
    </div>
  );
}
