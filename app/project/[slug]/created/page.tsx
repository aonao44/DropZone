import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProjectCreatedClient } from '@/components/ProjectCreatedClient';
import { DarkLayout } from '@/components/dark-layout';
import Header from '@/components/header';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProjectCreatedPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = createClient(await cookies());

  // プロジェクトの存在確認
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !project) {
    redirect('/dashboard');
  }

  return (
    <DarkLayout>
      <Header />
      <ProjectCreatedClient project={project} slug={slug} />
    </DarkLayout>
  );
}
