import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { IncidentFilters, IncidentPriority, IncidentStatus } from "@/types/newIncident";

interface IncidentsFiltersCompactProps {
  value: IncidentFilters;
  onChange: (filters: IncidentFilters) => void;
}

const ALL_STATUSES: IncidentStatus[] = ["open", "in_progress", "pending", "resolved", "closed", "cancelled"];
const ALL_PRIORITIES: IncidentPriority[] = ["critical", "high", "medium", "low"];

export const IncidentsFiltersCompact: React.FC<IncidentsFiltersCompactProps> = ({ value, onChange }) => {
  const toggleInArray = <T extends string>(arr: T[] | undefined, v: T): T[] => {
    const next = new Set(arr || []);
    if (next.has(v)) next.delete(v); else next.add(v);
    return Array.from(next);
  };

  const updateStatuses = (s: IncidentStatus) => onChange({ ...value, status: toggleInArray(value.status, s) });
  const updatePriorities = (p: IncidentPriority) => onChange({ ...value, priority: toggleInArray(value.priority, p) });
  const clearAll = () => onChange({});

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-card px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Estado:</span>
        {ALL_STATUSES.map((s) => (
          <label key={s} className="flex items-center gap-1 text-xs text-foreground">
            <Checkbox
              checked={value.status?.includes(s) || false}
              onCheckedChange={() => updateStatuses(s)}
              className="h-3.5 w-3.5"
            />
            <span className="capitalize">{s.replace("_", " ")}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Prioridad:</span>
        {ALL_PRIORITIES.map((p) => (
          <label key={p} className="flex items-center gap-1 text-xs text-foreground">
            <Checkbox
              checked={value.priority?.includes(p) || false}
              onCheckedChange={() => updatePriorities(p)}
              className="h-3.5 w-3.5"
            />
            <span className="capitalize">{p}</span>
          </label>
        ))}
      </div>
      <div className="ml-auto">
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={clearAll}>Limpiar</Button>
      </div>
    </div>
  );
};

export default IncidentsFiltersCompact;
