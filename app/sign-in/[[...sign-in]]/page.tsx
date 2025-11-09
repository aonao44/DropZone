import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            DropZoneへようこそ
          </h1>
          <p className="text-zinc-400">
            アカウントにログインしてください
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-zinc-900/50 backdrop-blur-xl border-zinc-800 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white",
              formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-sm normal-case",
              formFieldLabel: "text-zinc-300",
              formFieldInput: "bg-zinc-800 border-zinc-700 text-white",
              footerActionLink: "text-emerald-500 hover:text-emerald-400",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-emerald-500 hover:text-emerald-400"
            }
          }}
        />
      </div>
    </div>
  )
}
