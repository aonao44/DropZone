import { ClientSubmissionForm } from "@/components/client-submission-form";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-900 transition-colors duration-300">
      <ClientSubmissionForm />
    </main>
  );
}
