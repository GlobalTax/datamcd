import React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IncidentStatus, IncidentWithRelations } from "@/types/newIncident";
import { Circle, Clock, CheckCircle2, XCircle, PauseCircle, Archive, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentKanbanCardProps {
  incident: IncidentWithRelations;
  onChangeStatus?: (id: string, status: IncidentStatus) => void;
}

const statusIconMap: Record<IncidentStatus, React.ReactNode> = {
  open: <Circle className="h-3 w-3" />,
  in_progress: <Clock className="h-3 w-3" />,
  resolved: <CheckCircle2 className="h-3 w-3" />,
  closed: <Archive className="h-3 w-3" />,
  pending: <PauseCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
};

const allStatuses: IncidentStatus[] = [
  "open",
  "in_progress",
  "pending",
  "resolved",
  "closed",
  "cancelled",
];

function priorityBorder(priority?: string) {
  switch (priority) {
    case "critical":
      return "border-l-destructive";
    case "high":
      return "border-l-mcd-red";
    case "medium":
      return "border-l-primary";
    default:
      return "border-l-muted";
  }
}

export const IncidentKanbanCard: React.FC<IncidentKanbanCardProps> = ({ incident, onChangeStatus }) => {
  return (
    <div
      className={cn(
        "relative rounded-md border bg-card text-card-foreground shadow-sm p-2 pr-8 h-20 max-h-20 overflow-hidden",
        "border-l-4",
        priorityBorder(incident.priority)
      )}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 text-muted-foreground">
          {statusIconMap[incident.status]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{incident.title}</div>
          <div className="truncate text-xs text-muted-foreground">
            {incident.restaurant?.name || "Sin restaurante"}
            {incident.restaurant?.site_number ? ` · ${incident.restaurant.site_number}` : ""}
          </div>
          {incident.assigned_user?.full_name && (
            <div className="truncate text-[11px] text-muted-foreground">Asignado: {incident.assigned_user.full_name}</div>
          )}
        </div>
      </div>

      {/* Dropdown de cambio rápido de estado */}
      <div className="absolute right-1 top-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50">
            {allStatuses.map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => onChangeStatus?.(incident.id, s)}
                className="text-xs"
              >
                <span className="mr-2 inline-flex items-center text-muted-foreground">
                  {statusIconMap[s as IncidentStatus]}
                </span>
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default IncidentKanbanCard;
