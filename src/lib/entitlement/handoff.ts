import { DEEPLINK } from "@/lib/config";

/**
 * The "multi-rail handoff": after provisioning, the user gets the SAME signed
 * token over several rails so at least one lands regardless of device/context:
 *
 *   1. Deep link  — opens the installed app directly (silent recognition).
 *   2. Universal link / store fallback — opens the app, or the store to install.
 *   3. QR code    — scan from desktop to continue on phone.
 *   4. Email      — durable copy of the link for later / another device.
 *
 * All rails carry the identical entitlement token, so whichever the user uses,
 * the app verifies once and unlocks.
 */

export interface HandoffLinks {
  /** Custom-scheme deep link (works when the app is already installed). */
  deepLink: string;
  /** HTTPS universal link (opens app if installed, else web → store). */
  universalLink: string;
  /** Same universal link — encode this into a QR for desktop→mobile. */
  qrTarget: string;
}

export function buildHandoffLinks(token: string): HandoffLinks {
  const q = `token=${encodeURIComponent(token)}`;
  const deepLink = `${DEEPLINK.scheme}://open?${q}`;
  const universalLink = `${DEEPLINK.universalLink}/open?${q}`;
  return {
    deepLink,
    universalLink,
    qrTarget: universalLink,
  };
}
