import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Monitor, Speaker, ServerCog, Cable, Camera } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoomPlanViewerProps {
  roomId: string;
  roomLength?: number;
  roomWidth?: number;
}

interface ElementSalle {
  id: string;
  type_element: string;
  label?: string;
  position_x: number;
  position_y: number;
  commentaire?: string;
}

const ELEMENT_TYPES = [
  { value: "Écran", icon: Monitor },
  { value: "Enceinte", icon: Speaker },
  { value: "Régie", icon: ServerCog },
  { value: "Connectique", icon: Cable },
  { value: "Caméra", icon: Camera },
];

const getElementIcon = (type: string) => {
  const elementType = ELEMENT_TYPES.find(t => t.value === type);
  return elementType?.icon || Monitor;
};

export const RoomPlanViewer = ({ roomId, roomLength, roomWidth }: RoomPlanViewerProps) => {
  const { data: elements = [] } = useQuery({
    queryKey: ["elements_salle", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("elements_salle")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data as ElementSalle[];
    },
  });

  if (!roomLength || !roomWidth || elements.length === 0) {
    return null;
  }

  const aspectRatio = roomWidth / roomLength;
  const planHeight = 300;
  const planWidth = planHeight * aspectRatio;

  const elementCounts = elements.reduce((acc, el) => {
    acc[el.type_element] = (acc[el.type_element] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Plan de la salle – Implantation</h3>

      <div className="flex justify-center">
        <div
          className="relative border-2 border-border bg-muted/20"
          style={{
            width: `${Math.min(planWidth, 500)}px`,
            height: `${planHeight}px`,
          }}
        >
          <TooltipProvider>
            {elements.map((element) => {
              const Icon = getElementIcon(element.type_element);
              return (
                <Tooltip key={element.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${element.position_x}%`,
                        top: `${element.position_y}%`,
                      }}
                    >
                      <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-md">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{element.type_element}</p>
                      {element.label && <p className="text-sm">{element.label}</p>}
                      {element.commentaire && (
                        <p className="text-xs text-muted-foreground">{element.commentaire}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {Object.entries(elementCounts).map(([type, count]) => {
          const Icon = getElementIcon(type);
          return (
            <div key={type} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span>
                {type}: <strong>{count}</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
