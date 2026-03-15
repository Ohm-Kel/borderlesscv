"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TagEditor({
  label,
  values,
  onChange,
  placeholder,
  helperText,
}: {
  label: string;
  values: string[];
  onChange: (nextValues: string[]) => void;
  placeholder: string;
  helperText?: string;
}) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const value = draft.trim();
    if (!value) {
      return;
    }

    if (!values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        {helperText ? <p className="text-sm text-slate-500">{helperText}</p> : null}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue();
            }
          }}
        />
        <Button type="button" variant="secondary" size="icon" onClick={addValue}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <div key={value} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
            {value}
            <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} className="rounded-full p-0.5 transition hover:bg-slate-200">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
