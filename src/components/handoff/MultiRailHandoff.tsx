"use client";

import { useState, type ReactNode } from "react";
import { QRCode } from "./QRCode";
import { Arrow } from "@/components/ui/Button";
import { AndroidIcon, AppleIcon, CheckIcon } from "@/components/ui/icons";
import { clsx } from "@/lib/clsx";
import { STORES } from "@/lib/config";
import type { ProvisionResult } from "@/lib/provision";

const CARD_SHELL =
  "rounded-[28px] border border-gold/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_45%,rgba(255,255,255,0.02)_100%)] backdrop-blur-2xl ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-20px_40px_rgba(0,0,0,0.42),0_0_0_1px_rgba(212,175,55,0.16),0_14px_36px_rgba(0,0,0,0.5)]";

type PlatformKey = "android" | "ios";

const PLATFORM_OPTIONS: {
  key: PlatformKey;
  icon: ReactNode;
  label: string;
  cta: string;
  url: string;
}[] = [
  {
    key: "android",
    icon: <AndroidIcon className="h-6 w-6" />,
    label: STORES.android.platform,
    cta: "Get it on Google Play",
    url: STORES.android.url,
  },
  {
    key: "ios",
    icon: <AppleIcon className="h-6 w-6" />,
    label: STORES.ios.platform,
    cta: "Download on the App Store",
    url: STORES.ios.url,
  },
];

/**
 * Handoff — the end of the web path. One unified card with next steps +
 * device selection, then a platform-specific QR that updates on choice.
 */
export function MultiRailHandoff({ result }: { result: ProvisionResult }) {
  const { handoff: links, email, plan, tier, interval, addon } = result;

  return (
    <div className="flex flex-col gap-8 overflow-x-hidden animate-rise">
      <header className="mx-auto w-full max-w-md px-1 text-center">
        <div className="relative mx-auto h-16 w-16">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold/25" />
          <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gold text-[#15110A] shadow-[0_0_44px_rgba(201,162,75,0.45)]">
            <CheckIcon className="h-8 w-8" />
          </span>
        </div>
        <h1 className="mt-6 font-display text-[clamp(30px,6vw,44px)] font-semibold leading-none text-white">
          You’re in
        </h1>
        <p className="mt-4 break-words text-[15px] leading-[1.55] text-ash">
          Your membership is active. Install the app and sign in with{" "}
          <span className="break-all text-white">{email}</span> — you won’t be charged again.
        </p>
        <p className="mt-4 inline-block max-w-full break-words rounded-full border border-line bg-card px-3 py-1.5 font-mono text-[11px] leading-[1.4] text-gold-hi sm:px-3.5 sm:text-[11.5px]">
          {plan} · {tier} · billed {interval === "year" ? "yearly" : "monthly"}
          {addon ? " · + Custom Brain Booster" : ""}
        </p>
      </header>

      <section className={`${CARD_SHELL} p-5 sm:p-6 lg:p-8`}>
        <p className="lab mb-3 sm:mb-4">What happens next</p>
        <ol className="flex flex-col gap-3 sm:gap-4">
          <NextStep
            n={1}
            title="Install the app"
            body="Choose your phone below, then scan the QR code or tap the store."
          />
          <NextStep
            n={2}
            title={
              <>
                Sign in with <span className="break-all text-white">{email}</span>
              </>
            }
            body="Use the same email you checked out with."
          />
          <NextStep
            n={3}
            title="Your membership unlocks"
            body={`Your ${tier} plan activates automatically — you won’t be charged again.`}
          />
        </ol>

        <div className="my-6 border-t border-gold/15 sm:my-8" />

        <DeviceInstallPicker />
      </section>

      <div className="text-center">
        <a
          href={links.deepLink}
          className="text-sm text-gold-hi underline underline-offset-2"
        >
          Already installed? Open the app directly
        </a>
      </div>
    </div>
  );
}

function DeviceInstallPicker() {
  const [selected, setSelected] = useState<PlatformKey | null>(null);
  const active = PLATFORM_OPTIONS.find((o) => o.key === selected) ?? null;

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="mb-5 text-center sm:mb-6">
        <span className="inline-block rounded-full border border-line bg-card/60 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-label text-muted">
          {selected ? "Scan or tap to install on your phone" : "Choose your device"}
        </span>
      </p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {PLATFORM_OPTIONS.map((option) => {
          const isActive = selected === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() =>
                setSelected((current) => (current === option.key ? null : option.key))
              }
              aria-pressed={isActive}
              className={clsx(
                "flex flex-col items-center gap-3 rounded-2xl border px-4 py-5 transition duration-300 sm:py-6",
                isActive
                  ? "border-gold bg-gold/10 shadow-[0_0_0_1px_rgba(212,175,55,0.25)]"
                  : "border-white/15 bg-white/[0.03] hover:border-gold/50 hover:bg-white/[0.05]",
              )}
            >
              <span
                className={clsx(
                  "grid h-11 w-11 place-items-center rounded-xl border transition",
                  isActive
                    ? "border-gold/50 bg-[#0A0A0A] text-gold"
                    : "border-gold/30 bg-[#0A0A0A] text-paper",
                )}
              >
                {option.icon}
              </span>
              <span className="font-display text-[18px] font-semibold text-white sm:text-[20px]">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={clsx(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
          selected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          {active ? (
            <div
              key={active.key}
              className="flex flex-col items-center gap-4 pt-8 animate-rise"
            >
              <div className="rounded-[2px] bg-paper p-3 shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
                <QRCode value={active.url} size={168} />
              </div>
              <p className="m-0 font-mono text-[11px] uppercase tracking-label text-muted">
                {active.label} install link
              </p>
              <a
                href={active.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full max-w-[280px] items-center justify-center gap-2 whitespace-nowrap rounded-[6px] bg-gold-cta px-4 py-2.5 text-[14px] font-semibold text-[#15110A] transition hover:bg-gold-hi"
              >
                {active.cta} <Arrow />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function NextStep({
  n,
  title,
  body,
}: {
  n: number;
  title: ReactNode;
  body: string;
}) {
  return (
    <li className="flex gap-2.5 sm:gap-3.5">
      <span className="grid h-5 w-5 flex-none place-items-center rounded-full border border-gold/50 bg-gold/10 font-mono text-[10px] text-gold-hi sm:h-6 sm:w-6 sm:text-[11px]">
        {n}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-[14px] font-semibold leading-[1.4] text-white sm:text-[15px]">{title}</p>
        <p className="m-0 mt-0.5 text-[12.5px] leading-[1.5] text-ash sm:text-[13.5px]">{body}</p>
      </div>
    </li>
  );
}
