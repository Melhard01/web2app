"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AnswerSet } from "@/lib/quiz/types";
import type { BillingInterval } from "@/lib/config";

/**
 * Funnel state lives client-side and is persisted to sessionStorage so a user
 * can move quiz → report → paywall → checkout → success (and refresh) without
 * losing context. The only server-trusted artifact is the signed entitlement
 * token minted at provision time — this is just UX continuity.
 */

export interface SelectedOffer {
  offerId: string;
  interval: BillingInterval;
  /** Whether the optional voice-print add-on is included. */
  addon: boolean;
}

export interface FunnelState {
  answers: AnswerSet;
  /** Resolved profile key (set when the report renders). */
  profile: string | null;
  selected: SelectedOffer | null;
  email: string | null;
  paid: boolean;
  orderRef: string | null;
}

const EMPTY: FunnelState = {
  answers: {},
  profile: null,
  selected: null,
  email: null,
  paid: false,
  orderRef: null,
};

const STORAGE_KEY = "epiminded.funnel.v1";

interface FunnelContextValue extends FunnelState {
  setAnswer: (questionId: string, key: string) => void;
  setProfile: (profile: string) => void;
  selectOffer: (offer: SelectedOffer) => void;
  setEmail: (email: string) => void;
  markPaid: (orderRef: string) => void;
  reset: () => void;
}

const FunnelContext = createContext<FunnelContextValue | null>(null);

export function FunnelProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FunnelState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — non-fatal */
    }
  }, [state, hydrated]);

  const setAnswer = useCallback((questionId: string, key: string) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: key } }));
  }, []);

  const setProfile = useCallback((profile: string) => {
    setState((s) => (s.profile === profile ? s : { ...s, profile }));
  }, []);

  const selectOffer = useCallback((selected: SelectedOffer) => {
    setState((s) => ({ ...s, selected }));
  }, []);

  const setEmail = useCallback((email: string) => {
    setState((s) => ({ ...s, email }));
  }, []);

  const markPaid = useCallback((orderRef: string) => {
    setState((s) => ({ ...s, paid: true, orderRef }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo<FunnelContextValue>(
    () => ({ ...state, setAnswer, setProfile, selectOffer, setEmail, markPaid, reset }),
    [state, setAnswer, setProfile, selectOffer, setEmail, markPaid, reset],
  );

  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>;
}

export function useFunnel(): FunnelContextValue {
  const ctx = useContext(FunnelContext);
  if (!ctx) throw new Error("useFunnel must be used within <FunnelProvider>");
  return ctx;
}
