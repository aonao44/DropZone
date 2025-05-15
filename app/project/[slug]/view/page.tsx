import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ProjectSubmissionCard } from "@/components/ProjectSubmissionCard";

export default async function ViewSubmissionsPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (projectError || !project) {
    notFound();
  }
  
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('*')
    .eq('project_slug', slug)
    .order('submitted_at', { ascending: false });
  
  const hasSubmissions = submissions && submissions.length > 0;

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">提出一覧: {project.title}</h1>
      </div>
      
      {submissionsError && (
        <div className="p-4 mb-4 text-red-500 bg-red-100 rounded-lg">
          エラーが発生しました。もう一度お試しください。
        </div>
      )}
      
      {!submissionsError && !hasSubmissions && (
        <div className="p-8 text-center">
          <p className="text-xl text-gray-500">提出が見つかりませんでした</p>
        </div>
      )}
      
      {hasSubmissions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {submissions.map((submission) => (
            <ProjectSubmissionCard 
              key={submission.id}
              submission={submission}
            />
          ))}
        </div>
      )}
    </div>
  );
}
