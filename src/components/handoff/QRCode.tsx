"use client";

import { useEffect, useState } from "react";
import QR from "qrcode";

/** Renders a QR code (as a PNG data URL) for desktop→mobile handoff. */
export function QRCode({ value, size = 192 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QR.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#0A0A0A", light: "#F4F1E8" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => setDataUrl(null));
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-xl bg-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Scan to open the app on your phone"
      width={size}
      height={size}
      className="rounded-xl"
    />
  );
}
