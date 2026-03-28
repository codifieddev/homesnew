"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const PROPERTY_TYPES = ["Plot", "Apartment", "Villa", "Independent House"];
const BUDGET_RANGES = [
  { label: "Under ₹50 Lac",   value: "0-5000000" },
  { label: "₹50L – ₹1 Cr",   value: "5000000-10000000" },
  { label: "₹1 Cr – ₹2 Cr",  value: "10000000-20000000" },
  { label: "₹2 Cr – ₹5 Cr",  value: "20000000-50000000" },
  { label: "Above ₹5 Cr",     value: "50000000-999999999" },
];

export function HeroSearch() {
  const router = useRouter();
  const [location, setLocation]   = useState("");
  const [type, setType]           = useState("");
  const [budget, setBudget]       = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set("search", location.trim());
    if (type)            params.set("type", type);
    if (budget) {
      const [min, max] = budget.split("-");
      params.set("minPrice", min);
      params.set("maxPrice", max);
    }
    router.push(`/projects${params.toString() ? `?${params}` : ""}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const fieldBase = "flex-1 min-w-0 px-4 py-3 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground";
  const selectBase = "flex-1 min-w-0 px-4 py-3 bg-transparent outline-none text-sm text-foreground cursor-pointer appearance-none";

  return (
    <div className="flex max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-accent backdrop-blur-sm sm:flex-row">

      {/* Location */}
      <div className="flex-1 flex items-center border-b sm:border-b-0 sm:border-r border-border">
        <div className="pl-4 pr-2 flex-shrink-0">
          <span className="text-[9px] text-primary uppercase tracking-widest block mb-0.5">Location</span>
        </div>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Sushant Golf City, Sultanpur Rd…"
          className={fieldBase}
        />
      </div>

      {/* Property Type */}
      <div className="flex-1 flex items-center border-b sm:border-b-0 sm:border-r border-border">
        <div className="pl-4 pr-2 flex-shrink-0">
          <span className="text-[9px] text-primary uppercase tracking-widest block mb-0.5">Type</span>
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={`${selectBase} ${type ? "text-foreground" : "text-muted-foreground"}`}
          style={{ background: "transparent" }}
        >
          <option value="" className="bg-card text-muted-foreground">Any Type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t} className="bg-card text-foreground">{t}</option>
          ))}
        </select>
      </div>

      {/* Budget */}
      <div className="flex-1 flex items-center sm:border-r border-border">
        <div className="pl-4 pr-2 flex-shrink-0">
          <span className="text-[9px] text-primary uppercase tracking-widest block mb-0.5">Budget</span>
        </div>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className={`${selectBase} ${budget ? "text-foreground" : "text-muted-foreground"}`}
          style={{ background: "transparent" }}
        >
          <option value="" className="bg-card text-muted-foreground">Any Budget</option>
          {BUDGET_RANGES.map((r) => (
            <option key={r.value} value={r.value} className="bg-card text-foreground">{r.label}</option>
          ))}
        </select>
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="flex items-center justify-center gap-2 px-6 py-4 bg-primary hover:bg-primary-light text-foreground font-semibold text-sm transition-colors flex-shrink-0 m-1 rounded-xl"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </div>
  );
}
