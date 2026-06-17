"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

type GlobalLoadingContextValue = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const GlobalLoadingContext =
  createContext<GlobalLoadingContextValue | null>(null);

export function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsLoading(false);
  }, []);

  const startLoading = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    setIsLoading(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsLoading(false);
      timeoutRef.current = null;
    }, 20000);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(stopLoading, 0);

    return () => window.clearTimeout(timeout);
  }, [pathname, searchParams, stopLoading]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");

      if (!anchor || !shouldLoadForAnchor(anchor)) {
        return;
      }

      startLoading();
    }

    function handleSubmit(event: SubmitEvent) {
      if (event.defaultPrevented) {
        return;
      }

      startLoading();
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, [startLoading]);

  const value = useMemo(
    () => ({
      isLoading,
      startLoading,
      stopLoading,
    }),
    [isLoading, startLoading, stopLoading]
  );

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      {isLoading ? <GlobalLoadingOverlay /> : null}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);

  if (!context) {
    throw new Error(
      "useGlobalLoading must be used inside GlobalLoadingProvider."
    );
  }

  return context;
}

function shouldLoadForAnchor(anchor: HTMLAnchorElement) {
  if (
    anchor.target ||
    anchor.download ||
    anchor.getAttribute("aria-disabled") === "true"
  ) {
    return false;
  }

  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return false;
  }

  const url = new URL(anchor.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  return (
    url.pathname !== window.location.pathname ||
    url.search !== window.location.search ||
    url.hash !== window.location.hash
  );
}

function GlobalLoadingOverlay() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[100] cursor-wait bg-neutral-950/15"
    >
      <div className="fixed left-0 top-0 h-1 w-full overflow-hidden bg-neutral-900">
        <div className="h-full w-1/2 animate-[ac-progress_1s_ease-in-out_infinite] bg-neutral-100" />
      </div>
    </div>
  );
}
