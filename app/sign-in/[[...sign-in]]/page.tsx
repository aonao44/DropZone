// /app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <SignIn routing="path" path="/sign-in" afterSignInUrl="/submit" />
    </div>
  );
}
