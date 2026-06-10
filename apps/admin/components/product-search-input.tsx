"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import { useDebounce } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";

type ProductSearchItem = {
  id: string;
  title: string;
  categoryLabel: string;
};

export function ProductSearchInput({
  name,
  defaultValue,
  placeholder,
  id,
  className
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [value, setValue] = useState(defaultValue ?? "");
  const [items, setItems] = useState<ProductSearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 300);

  const shouldSearch = debouncedValue.trim().length >= 2;
  const normalizedValue = useMemo(() => value.trim().toLowerCase(), [value]);

  useEffect(() => {
    if (!shouldSearch) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const searchProducts = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/search/products?q=${encodeURIComponent(debouncedValue.trim())}`,
          {
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product suggestions.");
        }

        const data = (await response.json()) as { items: ProductSearchItem[] };
        setItems(data.items);
        setOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setItems([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void searchProducts();

    return () => {
      controller.abort();
    };
  }, [debouncedValue, shouldSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={inputId}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (items.length > 0) {
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          className="pl-9"
          autoComplete="off"
        />
      </div>

      {open && (loading || items.length > 0) ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {loading ? (
            <div className="px-3 py-2 text-sm text-slate-500">Searching...</div>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {items.map((item) => {
                const active =
                  normalizedValue === item.id.toLowerCase() ||
                  normalizedValue === item.title.toLowerCase();

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start px-3 py-2 text-left hover:bg-slate-50",
                        active && "bg-slate-50"
                      )}
                      onClick={() => {
                        setValue(item.title);
                        setOpen(false);
                      }}
                    >
                      <span className="text-sm font-medium text-slate-900">{item.title}</span>
                      <span className="text-xs text-slate-500">
                        {item.id} {item.categoryLabel ? `• ${item.categoryLabel}` : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
