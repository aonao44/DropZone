import { DownloadAllButton } from "@/components/DownloadAllButton";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Fetch project data
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', params.slug)
    .single();
    
  if (error || !project) {
    notFound();
  }
  
  // Fetch submissions count
  const { count, error: countError } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', project.id);
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        
        <div className="flex gap-2">
          {(count && count > 0) && (
            <DownloadAllButton 
              projectSlug={params.slug} 
              variant="secondary"
            />
          )}
          {/* Other action buttons */}
        </div>
      </div>
      
      {/* Rest of your project page content */}
    </div>
  );
}
