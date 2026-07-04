"use client";

import { useRef, useState } from "react";
import { updateAccount } from "@/app/(app)/settings/actions";
import { UserAvatar } from "@/components/friends/UserAvatar";
import { Field, Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { compressAvatarFile } from "@/lib/image/compress-avatar";

export function AccountProfileForm({
  name,
  username,
  image,
}: {
  name: string | null;
  username: string | null;
  image: string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(image);
  const [avatarPayload, setAvatarPayload] = useState("keep");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    setAvatarError(null);

    try {
      const dataUrl = await compressAvatarFile(file);
      setPreviewImage(dataUrl);
      setAvatarPayload(dataUrl);
    } catch {
      setAvatarError("Kunne ikke bruke bildet. Prøv et mindre bilde.");
    }
  }

  function useInitials() {
    setPreviewImage(null);
    setAvatarPayload("clear");
    setAvatarError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <form action={updateAccount} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="account-avatar-btn group relative shrink-0"
          aria-label="Bytt profilbilde"
        >
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL
            <img src={previewImage} alt="" className="account-avatar-btn__img" />
          ) : (
            <UserAvatar name={name} username={username} size="lg" />
          )}
          <span className="account-avatar-btn__overlay">Bytt</span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-zinc-100">{name ?? "Uten navn"}</p>
          {username && <p className="truncate text-sm text-zinc-500">@{username}</p>}
          <button
            type="button"
            onClick={useInitials}
            className="mt-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-[#ff8f4c]"
          >
            Bruk initialer
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFileChange(e.target.files?.[0])}
        />
      </div>

      {avatarError && <p className="text-sm text-red-400">{avatarError}</p>}

      <Field label="Navn">
        <Input type="text" name="name" required defaultValue={name ?? ""} maxLength={80} />
      </Field>
      <Field label="Brukernavn">
        <Input
          type="text"
          name="username"
          required
          defaultValue={username ?? ""}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          minLength={3}
          maxLength={30}
          pattern="[a-zA-Z0-9_]{3,30}"
        />
      </Field>

      <input type="hidden" name="avatar" value={avatarPayload} />

      <SubmitButton size="md" pendingLabel="Lagrer…" className="self-start">
        Lagre
      </SubmitButton>
    </form>
  );
}
