import React, { useMemo } from "react";
import { IncidentStatus, IncidentWithRelations } from "@/types/newIncident";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentKanbanCard } from "./IncidentKanbanCard";

interface KanbanBoardProps {
  incidents: IncidentWithRelations[];
  onChangeStatus?: (id: string, status: IncidentStatus) => void;
}

const columns: { key: IncidentStatus; title: string }[] = [
  { key: "open", title: "Abiertas" },
  { key: "in_progress", title: "En progreso" },
  { key: "pending", title: "Pendientes" },
  { key: "resolved", title: "Resueltas" },
  { key: "closed", title: "Cerradas" },
  { key: "cancelled", title: "Canceladas" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ incidents, onChangeStatus }) => {
  const grouped = useMemo(() => {
    const map: Record<IncidentStatus, IncidentWithRelations[]> = {
      open: [], in_progress: [], pending: [], resolved: [], closed: [], cancelled: []
    };
    incidents?.forEach((i) => {
      const k = (i.status || "open") as IncidentStatus;
      map[k]?.push(i);
    });
    return map;
  }, [incidents]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3 xl:gap-4 2xl:gap-5">
      {columns.map((col) => (
        <Card key={col.key} className="bg-card">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>{col.title}</span>
              <span className="text-xs text-muted-foreground font-normal">{grouped[col.key]?.length || 0}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 max-h-[70vh] overflow-auto">
            {grouped[col.key]?.map((incident) => (
              <IncidentKanbanCard
                key={incident.id}
                incident={incident}
                onChangeStatus={onChangeStatus}
              />
            ))}
            {grouped[col.key]?.length === 0 && (
              <div className="text-xs text-muted-foreground py-2">Sin incidencias</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KanbanBoard;
