import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
