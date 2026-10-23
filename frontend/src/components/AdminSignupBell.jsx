import React, { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";

export const AdminSignupBell = ({ onOpenUser }) => {
  const [data, setData] = useState({ unread: 0, recent: [] });

  const load = useCallback(async () => {
    try { const { data } = await api.get("/admin/signups/unread"); setData(data); } catch { /* */ }
  }, []);
  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);

  const onOpen = async (open) => {
    if (open && data.unread > 0) {
      try { await api.post("/admin/signups/mark-read"); setData((d) => ({ ...d, unread: 0 })); } catch { /* */ }
    }
  };

  return (
    <Popover onOpenChange={onOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-full p-2 hover:bg-secondary" data-testid="admin-signup-bell">
          <Bell className="h-5 w-5 text-[hsl(var(--gold))]" />
          {data.unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white" data-testid="admin-signup-count">{data.unread}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 bg-card p-0" data-testid="admin-signup-list">
        <p className="border-b border-border px-4 py-3 font-serif text-lg font-semibold">Nouveaux inscrits</p>
        <div className="max-h-96 overflow-y-auto">
          {data.recent.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">Aucun inscrit pour l'instant.</p>}
          {data.recent.map((u) => (
            <button key={u.user_id} onClick={() => onOpenUser?.(u.user_id)} className="flex w-full items-start gap-2 border-b border-border/50 px-4 py-2.5 text-left text-sm hover:bg-secondary" data-testid={`signup-item-${u.user_id}`}>
              {u.new && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />}
              <span className="min-w-0">
                <span className="block truncate font-medium">{u.display_name || "Sans nom"}{u.country ? ` · ${u.country}` : ""}</span>
                <span className="block truncate text-xs text-muted-foreground">{u.email} · {new Date(u.created_at).toLocaleString("fr-FR")}</span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
