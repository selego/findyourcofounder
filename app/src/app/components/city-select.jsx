"use client";

import { useEffect, useRef, useState } from "react";
import { useCombobox } from "downshift";
import { searchEuropeanCities } from "@/lib/photon";

// Emits two synthetic input events back to the parent so it can keep using
// the same `onChange({ target: { name, value } })` handler it uses for inputs.
function emit(onChange, name, value) {
  onChange({ target: { name, value } });
}

export function CitySelect({ value, onChange, required }) {
  const { city = "", country = "" } = value || {};

  const [inputValue, setInputValue] = useState(city);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(city);
  }, [city]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const q = inputValue.trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      const results = await searchEuropeanCities(q, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setItems(results);
      setLoading(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items,
    inputValue,
    itemToString: (item) => (item ? item.city : ""),
    onInputValueChange: ({ inputValue: next, type }) => {
      setInputValue(next ?? "");
      if (type === useCombobox.stateChangeTypes.InputChange) {
        if ((next ?? "") !== city) {
          emit(onChange, "city", "");
          emit(onChange, "country", "");
        }
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) return;
      setInputValue(selectedItem.city);
      emit(onChange, "city", selectedItem.city);
      emit(onChange, "country", selectedItem.country);
    },
  });

  const showMenu = isOpen && inputValue.trim().length >= 2;

  return (
    <div className="relative">
      <input
        type="text"
        autoComplete="off"
        placeholder=""
        {...getInputProps({
          // Block native form submit on Enter when nothing is highlighted
          onKeyDown: (e) => {
            if (e.key === "Enter" && highlightedIndex < 0) e.preventDefault();
          },
        })}
      />
      {/* Hidden field carries the validated city for native `required` */}
      <input
        type="text"
        name="city"
        value={city}
        required={required}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={() => {}}
      />
      {country && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] tracking-[0.18em] uppercase text-muted pointer-events-none">
          {country}
        </span>
      )}
      <ul
        {...getMenuProps()}
        className={`absolute left-0 right-0 mt-1 z-20 bg-paper border-[1.5px] border-ink rounded-xl shadow-card max-h-72 overflow-auto ${showMenu ? "" : "hidden"}`}
      >
        {showMenu && loading && (
          <li className="text-muted text-sm px-4 py-3">Searching…</li>
        )}
        {showMenu && !loading && items.length === 0 && (
          <li className="text-muted text-sm px-4 py-3">No matching European city.</li>
        )}
        {showMenu &&
          !loading &&
          items.map((item, index) => (
            <li
              key={`${item.city}-${item.country}-${item.region}-${index}`}
              {...getItemProps({ item, index })}
              className={`px-4 py-3 cursor-pointer flex items-baseline justify-between gap-3 ${
                highlightedIndex === index ? "bg-bg-soft" : ""
              }`}
            >
              <span className="text-ink text-sm">
                <span className="font-medium">{item.city}</span>
                {item.region && (
                  <span className="text-muted">, {item.region}</span>
                )}
              </span>
              <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-muted shrink-0">
                {item.country}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
