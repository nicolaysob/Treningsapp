import Link from "next/link";
import { saveHrMaxQuick } from "@/app/(app)/settings/training/actions";
import type { ThresholdSetup } from "@/lib/training-load/threshold-setup";
import { SubmitButton } from "@/components/ui/SubmitButton";

const METHOD_LABEL: Record<string, string> = {
  power: "watt",
  pace: "tempo",
  hr: "puls",
  mixed: "full",
};

export function ThresholdStatusChip({ setup }: { setup: ThresholdSetup }) {
  if (setup.hrMaxBpm) {
    return (
      <span className="threshold-chip threshold-chip--active">
        OLT · {setup.hrMaxBpm} maks
      </span>
    );
  }

  if (setup.needsHrMaxSetup && setup.suggestedHrMax) {
    return <span className="threshold-chip threshold-chip--pending">Trenger makspuls</span>;
  }

  if (setup.isActive && setup.method) {
    return (
      <span className="threshold-chip threshold-chip--active">
        Aktiv · {METHOD_LABEL[setup.method]}
      </span>
    );
  }

  return <span className="threshold-chip threshold-chip--pending">Ikke satt</span>;
}

export function ThresholdQuickSetup({
  setup,
  compact = false,
  returnTo,
}: {
  setup: ThresholdSetup;
  compact?: boolean;
  returnTo?: string;
}) {
  if (setup.hrMaxBpm) return null;
  if (!setup.needsHrMaxSetup) return null;

  if (!setup.suggestedHrMax) {
    return (
      <Link href="/settings/training" className="threshold-setup threshold-setup--link">
        <span className="threshold-setup__icon" aria-hidden>
          ♥
        </span>
        <span className="threshold-setup__label">Makspuls</span>
        <span className="threshold-setup__action">Sett →</span>
      </Link>
    );
  }

  if (compact) {
    return (
      <form action={saveHrMaxQuick} className="threshold-setup threshold-setup--compact">
        <span className="threshold-setup__icon" aria-hidden>
          ♥
        </span>
        <span className="threshold-setup__value">{setup.suggestedHrMax}</span>
        <input type="hidden" name="hrMaxBpm" value={setup.suggestedHrMax} />
        {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
        <SubmitButton className="threshold-setup__btn">Aktiver</SubmitButton>
      </form>
    );
  }

  return (
    <div className="threshold-setup">
      <div className="threshold-setup__row">
        <span className="threshold-setup__icon" aria-hidden>
          ♥
        </span>
        <div className="min-w-0 flex-1">
          <p className="threshold-setup__label">Makspuls</p>
          <p className="threshold-setup__value-lg">{setup.suggestedHrMax} bpm</p>
        </div>
        <form action={saveHrMaxQuick}>
          <input type="hidden" name="hrMaxBpm" value={setup.suggestedHrMax} />
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
          <SubmitButton>Aktiver</SubmitButton>
        </form>
      </div>
      <form action={saveHrMaxQuick} className="threshold-setup__manual">
        <input
          type="number"
          name="hrMaxBpm"
          min={120}
          max={230}
          placeholder="Annet tall"
          className="threshold-setup__input"
        />
        {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
        <SubmitButton size="sm" className="border border-white/10 bg-white/4 text-zinc-200 hover:border-white/15 hover:bg-white/8">
          Lagre
        </SubmitButton>
      </form>
    </div>
  );
}
