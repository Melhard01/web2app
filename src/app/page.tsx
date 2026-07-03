import { ButtonLink } from "@/components/ui/Button";
import { BrandHeader } from "@/components/ui/BrandHeader";

/**
 * Landing / ad destination — the brand hero (matches the marketing site). Paid
 * traffic lands here; both CTAs lead into the onboarding quiz.
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader full />

      <main className="mx-auto flex w-full max-w-[980px] flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <div className="animate-rise">
          <span className="mb-9 inline-block rounded-full border border-gold/40 px-5 py-2 font-mono text-[12px] uppercase tracking-eyebrow text-gold">
            EpiMinded · A Founders’ Cohort
          </span>

          <h1 className="m-0 font-display text-[clamp(40px,7vw,72px)] font-semibold leading-[1.04] tracking-[-0.01em] text-paper">
            AI gives you answers.{" "}
            <em className="italic text-gold">It doesn’t give you conviction.</em>
          </h1>

          <p className="mx-auto mt-8 max-w-[40em] text-[clamp(17px,2.2vw,21px)] leading-[1.5] text-ash">
            Five-minute daily insights tuned to where you are. Daily peer
            conversations with operators at your level. AI cognitive matching that
            builds the circle you didn’t think you could rebuild. Chosen, not
            contacted.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <ButtonLink href="/quiz">Apply to join</ButtonLink>
            <ButtonLink href="/quiz" variant="secondary">
              How it works
            </ButtonLink>
          </div>

          <p className="mt-7 font-mono text-[12px] tracking-[0.04em] text-muted">
            7 questions · about 2 minutes · for founders, CEOs, and operators
          </p>
        </div>
      </main>
    </div>
  );
}
