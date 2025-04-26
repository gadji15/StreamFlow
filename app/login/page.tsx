import LoginForm from "@/components/auth/login-form";

export const metadata = {
  title: "Connexion | StreamFlow",
  description: "Connectez-vous à votre compte StreamFlow",
};

export default function LoginPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-theme(space.24))]">
      <h1 className="sr-only">Connexion</h1>
      <LoginForm />
    </div>
  );
}