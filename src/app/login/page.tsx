import { LoginForm } from "@/components/login-form";

export default function LoginPage() {

  return (
      <div className="flex flex-1 items-center justify-center h-screen">
        <div className="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
  )
}
