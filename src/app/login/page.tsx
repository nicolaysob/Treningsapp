import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function handleLogin(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        username: formData.get("username"),
        password: formData.get("password"),
        redirectTo: "/",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw err;
    }
  }

  return (
    <AuthLayout
      title="Treningsapp"
      subtitle="Logg inn for å følge treningsbelastningen din og konkurrere med vennegjengen."
    >
      {error && <Alert>Feil brukernavn eller passord.</Alert>}

      <Card>
        <form action={handleLogin} className="flex flex-col gap-4">
          <Field label="Brukernavn">
            <Input type="text" name="username" required autoCapitalize="off" />
          </Field>
          <Field label="Passord">
            <Input type="password" name="password" required />
          </Field>
          <Button type="submit" size="lg" className="mt-1 w-full">
            Logg inn
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-zinc-500">
        Ny her?{" "}
        <Link href="/signup" className="font-medium text-zinc-300 transition-colors hover:text-white">
          Opprett konto
        </Link>
      </p>
    </AuthLayout>
  );
}
