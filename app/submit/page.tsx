// submit/page.tsx
import { ClientSubmissionForm } from "@/components/client-submission-form";
import { generateRandomSlug } from "@/lib/utils";

export default function SubmitPage() {
  const newSlug = generateRandomSlug();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <ClientSubmissionForm projectSlug={newSlug} showHistoryButton={false} />
    </div>
  );
}
