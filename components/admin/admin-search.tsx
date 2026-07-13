import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminSearchProps = {
  defaultValue?: string;
  placeholder?: string;
};

export function AdminSearch({
  defaultValue = "",
  placeholder = "ابحث بالاسم..."
}: AdminSearchProps) {
  return (
    <form
      method="get"
      className="flex w-full max-w-xl gap-2 rounded-2xl border border-borderSoft bg-white p-2 shadow-sm"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />

        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="border-0 bg-slate-50 pr-9"
        />
      </div>

      <Button type="submit">بحث</Button>
    </form>
  );
}
