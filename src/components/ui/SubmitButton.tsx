"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SubmitButton({
  children,
  pendingLabel = "Lagrer…",
  className = "",
  size = "sm",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size={size} disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
