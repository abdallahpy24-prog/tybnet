"use client";

import Link from "next/link";
import {
  Building2,
  Sparkles,
  Stethoscope
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState
} from "react";

type BeautyCategoryCardProps = {
  cosmeticDoctorsCount: number;
  cosmeticCentersCount: number;
};

export function BeautyCategoryCard({
  cosmeticDoctorsCount,
  cosmeticCentersCount
}: BeautyCategoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef =
    useRef<HTMLDivElement>(null);

  const totalCount =
    cosmeticDoctorsCount +
    cosmeticCentersCount;

  useEffect(() => {
    function handlePointerDown(
      event: MouseEvent | TouchEvent
    ) {
      const target = event.target;

      if (
        target instanceof Node &&
        !containerRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    document.addEventListener(
      "touchstart",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );

      document.removeEventListener(
        "touchstart",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative col-span-2 mx-auto w-[calc(50%_-_0.375rem)] min-w-0"
    >
      {isOpen ? (
        <div
          id="beauty-category-menu"
          role="menu"
          aria-label="أقسام التجميل"
          className="absolute bottom-[calc(100%+0.75rem)] left-1/2 z-30 w-[min(20rem,calc(100vw-3rem))] -translate-x-1/2 rounded-2xl border border-borderSoft bg-white p-2 shadow-2xl"
        >
          <Link
            href="/cosmetic-doctors"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-primary-soft"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-700">
              <Stethoscope
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-navy">
                أطباء التجميل
              </span>

              <span className="block text-xs font-bold text-slate-500">
                {cosmeticDoctorsCount} طبيب
              </span>
            </span>
          </Link>

          <div className="my-1 h-px bg-borderSoft" />

          <Link
            href="/cosmetic-centers"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-primary-soft"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-700">
              <Building2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-black text-navy">
                مراكز التجميل
              </span>

              <span className="block text-xs font-bold text-slate-500">
                {cosmeticCentersCount} مركز
              </span>
            </span>
          </Link>

          <span
            aria-hidden="true"
            className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-borderSoft bg-white"
          />
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="beauty-category-menu"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        className="w-full rounded-2xl border border-borderSoft bg-surface p-4 text-right transition hover:border-primary-soft hover:bg-primary-soft"
      >
        <Sparkles
          className="h-6 w-6 text-fuchsia-600"
          aria-hidden="true"
        />

        <p className="mt-3 text-3xl font-black text-navy">
          {totalCount}
        </p>

        <p className="text-sm font-bold text-slate-500">
          التجميل
        </p>
      </button>
    </div>
  );
}