"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";

export function PlannedWorkoutForm({
  date,
  action,
  pending,
  onClose,
}: {
  date: string;
  action: (formData: FormData) => void;
  pending: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="surface-card w-full max-w-sm p-5 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-100">Planlagt økt</h3>
            <p className="text-sm text-zinc-500">
              {new Date(date).toLocaleDateString("nb-NO", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="date" value={date} />

          <Field label="Type">
            <Select name="sport">
              <option value="RIDE">Sykkel</option>
              <option value="RUN">Løping</option>
              <option value="SWIM">Svømming</option>
              <option value="STRENGTH">Styrke</option>
              <option value="OTHER">Annet</option>
            </Select>
          </Field>

          <Field label="Beskrivelse">
            <Input
              type="text"
              name="description"
              required
              placeholder="f.eks. Intervaller 4x8min"
            />
          </Field>

          <Field label="Varighet (min)">
            <Input type="number" name="durationMin" min={1} required />
          </Field>

          <Button type="submit" disabled={pending} className="mt-1 w-full">
            {pending ? "Lagrer…" : "Legg til"}
          </Button>
        </form>
      </div>
    </div>
  );
}
