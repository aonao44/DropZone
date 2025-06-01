import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { DownloadButton } from "@/components/DownloadButton";

interface SubmissionFile {
  name: string;
  url: string;
}

export default async function ProjectViewPage({ params }: { params: Promise<{ slug: string }> }) {
  // In Next 15 the `params` object is actually a `Promise` when used in
  // route segments, so we need to await it before destructuring.
  const { slug } = await params;

  // fetch submission data for this project slug
  const supabase = createClient(cookies());
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("project_slug", slug ?? "")
    .order("submitted_at", { ascending: false });

  return (
    <>
      <div className="px-4 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-indigo-400">提出完了</h2>
        <Link
          href={`/submit?slug=${slug}`}
          className="inline-block bg-indigo-700 hover:bg-indigo-500 text-white text-sm border border-gray-600 rounded px-3 py-1 ml-4"
          style={{ marginLeft: "auto" }}
        >
          提出フォームへ戻る
        </Link>
        <Link
          href={`/submit?slug=${slug}`}
          className="inline-block text-gray-400 hover:text-white text-sm border border-gray-600 rounded px-3 py-1 ml-4"
        >
          ← 戻る
        </Link>
      </div>
      <div className="min-h-screen bg-gray-900 text-white px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {submissions && submissions.length > 0 ? (
            submissions.map((sub, index) => (
              <div key={sub.id} className="relative bg-gray-800 rounded-lg p-6 border border-gray-700 shadow">
                <div className="absolute top-4 right-4 text-xs text-gray-400">
                  {new Date(sub.submitted_at).toLocaleString("ja-JP", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <h3 className="mb-2 font-semibold text-lg">{index === 0 ? "提出完了" : "追加提出"}</h3>
                <p className="text-sm mb-4">提出者: {sub.name}</p>
                <div className="space-y-3">
                  {Array.isArray(sub.files) &&
                    sub.files.map((file: SubmissionFile) => (
                      <div key={file.url} className="flex items-center justify-between bg-gray-700 rounded-md p-3">
                        <span className="truncate text-sm">{file.name}</span>
                        <DownloadButton
                          url={file.url}
                          fileName={file.name}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-md text-sm border-none"
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">アップロードされたファイルはありません</div>
          )}
        </div>
      </div>
    </>
  );
}
