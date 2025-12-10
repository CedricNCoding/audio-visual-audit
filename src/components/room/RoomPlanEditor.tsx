import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Monitor, 
  Speaker, 
  ServerCog, 
  Cable, 
  Camera,
  Projector,
  RectangleHorizontal,
  X
} from "lucide-react";

interface RoomPlanEditorProps {
  roomId: string;
  roomLength?: number;
  roomWidth?: number;
}

interface ElementSalle {
  id: string;
  type_element: string;
  position_x: number;
  position_y: number;
}

const ELEMENT_TYPES = [
  { value: "Écran", label: "Écran", icon: Monitor },
  { value: "Vidéoprojecteur", label: "Vidéoprojecteur", icon: Projector },
  { value: "Écran de projection", label: "Écran projection", icon: RectangleHorizontal },
  { value: "Enceinte", label: "Enceinte", icon: Speaker },
  { value: "Régie", label: "Régie", icon: ServerCog },
  { value: "Connectique", label: "Connectique", icon: Cable },
  { value: "Caméra", label: "Caméra", icon: Camera },
];

const getElementIcon = (type: string) => {
  const elementType = ELEMENT_TYPES.find(t => t.value === type);
  return elementType?.icon || Monitor;
};

export const RoomPlanEditor = ({ roomId, roomLength, roomWidth }: RoomPlanEditorProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const planRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

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

  const createElementMutation = useMutation({
    mutationFn: async (element: Omit<ElementSalle, "id">) => {
      const { data, error } = await supabase
        .from("elements_salle")
        .insert([{ ...element, room_id: roomId }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elements_salle", roomId] });
      toast.success("Élément ajouté");
    },
  });

  const updateElementMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ElementSalle> }) => {
      const { error } = await supabase
        .from("elements_salle")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elements_salle", roomId] });
    },
  });

  const deleteElementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("elements_salle")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["elements_salle", roomId] });
      toast.success("Élément supprimé");
    },
  });

  const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedType || !planRef.current) return;

    const rect = planRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    createElementMutation.mutate({
      type_element: selectedType,
      position_x: Math.max(0, Math.min(100, x)),
      position_y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleMouseDown = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedElement(elementId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedElement || !planRef.current) return;

    const rect = planRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    updateElementMutation.mutate({
      id: draggedElement,
      updates: {
        position_x: Math.max(0, Math.min(100, x)),
        position_y: Math.max(0, Math.min(100, y)),
      },
    });
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  const handleDelete = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElementMutation.mutate(elementId);
  };

  if (!roomLength || !roomWidth) {
    return (
      <div className="p-4 border border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          Veuillez renseigner longueur et largeur pour afficher le plan.
        </p>
      </div>
    );
  }

  const aspectRatio = roomWidth / roomLength;
  const planHeight = 400;
  const planWidth = planHeight * aspectRatio;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Plan de la salle – Implantation des éléments</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sélectionnez un type puis cliquez sur le plan. Glissez pour déplacer.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ELEMENT_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(selectedType === type.value ? null : type.value)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {type.label}
            </Button>
          );
        })}
      </div>

      <div className="relative flex justify-center">
        <div
          ref={planRef}
          className="relative border-2 border-primary bg-background/50 cursor-crosshair select-none"
          style={{
            width: `${Math.min(planWidth, 600)}px`,
            height: `${planHeight}px`,
          }}
          onClick={handlePlanClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {elements.map((element) => {
            const Icon = getElementIcon(element.type_element);
            const isDragging = draggedElement === element.id;
            return (
              <div
                key={element.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab group ${isDragging ? 'cursor-grabbing z-50' : ''}`}
                style={{
                  left: `${element.position_x}%`,
                  top: `${element.position_y}%`,
                }}
                onMouseDown={(e) => handleMouseDown(element.id, e)}
              >
                <div className="relative">
                  <div className={`bg-primary text-primary-foreground p-2 rounded-full shadow-lg transition-transform ${isDragging ? 'scale-125' : 'hover:scale-110'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <button
                    onClick={(e) => handleDelete(element.id, e)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende des éléments placés */}
      {elements.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {ELEMENT_TYPES.map((type) => {
            const count = elements.filter(e => e.type_element === type.value).length;
            if (count === 0) return null;
            const Icon = type.icon;
            return (
              <span key={type.value} className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded">
                <Icon className="h-3 w-3" />
                {type.label}: {count}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
