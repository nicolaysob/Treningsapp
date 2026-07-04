import Link from "next/link";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function handleSignup(formData: FormData) {
    "use server";

    const username = formData.get("username")?.toString().trim().toLowerCase();
    const name = formData.get("name")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!username || !name || !password || password.length < 8) {
      redirect("/signup?error=invalid");
    }
    if (password !== confirmPassword) {
      redirect("/signup?error=mismatch");
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      redirect("/signup?error=taken");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { username, name, passwordHash },
    });

    await signIn("credentials", { username, password, redirectTo: "/" });
  }

  const errorMessage: Record<string, string> = {
    invalid: "Fyll ut alle felt. Passord må være minst 8 tegn.",
    mismatch: "Passordene er ikke like.",
    taken: "Brukernavnet er allerede i bruk.",
  };

  return (
    <AuthLayout title="Opprett konto" subtitle="Bli med og følg treningen sammen med venner.">
      {error && errorMessage[error] && <Alert>{errorMessage[error]}</Alert>}

      <Card>
        <form action={handleSignup} className="flex flex-col gap-4">
          <Field label="Navn">
            <Input type="text" name="name" required />
          </Field>
          <Field label="Brukernavn">
            <Input type="text" name="username" required autoCapitalize="off" />
          </Field>
          <Field label="Passord (min. 8 tegn)">
            <Input type="password" name="password" required minLength={8} />
          </Field>
          <Field label="Gjenta passord">
            <Input type="password" name="confirmPassword" required minLength={8} />
          </Field>
          <Button type="submit" size="lg" className="mt-1 w-full">
            Opprett konto
          </Button>
        </form>
      </Card>

      <p className="text-center text-sm text-zinc-500">
        Har du allerede konto?{" "}
        <Link href="/login" className="font-medium text-zinc-300 transition-colors hover:text-white">
          Logg inn
        </Link>
      </p>
    </AuthLayout>
  );
}
