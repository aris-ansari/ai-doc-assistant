import { AuthShell } from "@/components/auth/authShell";
import { RegisterForm } from "@/components/auth/registerForm";

export default function RegisterPage() {
  return (
    <AuthShell>
      <RegisterForm />
    </AuthShell>
  );
}
