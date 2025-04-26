import RegisterForm from "@/components/auth/register-form";

export const metadata = {
  title: "Inscription | StreamFlow",
  description: "Créez votre compte StreamFlow pour accéder à notre catalogue de films et séries",
};

export default function RegisterPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.24))]">
      <h1 className="sr-only">Inscription</h1>
      <RegisterForm />
    </div>
  );
}
