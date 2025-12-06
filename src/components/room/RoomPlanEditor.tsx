import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Monitor, 
  Speaker, 
  ServerCog, 
  Cable, 
  Camera,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trash2,
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
  label?: string;
  position_x: number;
  position_y: number;
  commentaire?: string;
}

const ELEMENT_TYPES = [
  { value: "Écran", label: "Écran", icon: Monitor },
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
  const [selectedElement, setSelectedElement] = useState<ElementSalle | null>(null);
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
      setSelectedElement(null);
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

  const handleElementClick = (element: ElementSalle, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  const moveElement = (direction: "up" | "down" | "left" | "right") => {
    if (!selectedElement) return;

    const delta = 3;
    let updates: Partial<ElementSalle> = {};

    switch (direction) {
      case "up":
        updates.position_y = Math.max(0, selectedElement.position_y - delta);
        break;
      case "down":
        updates.position_y = Math.min(100, selectedElement.position_y + delta);
        break;
      case "left":
        updates.position_x = Math.max(0, selectedElement.position_x - delta);
        break;
      case "right":
        updates.position_x = Math.min(100, selectedElement.position_x + delta);
        break;
    }

    updateElementMutation.mutate({ id: selectedElement.id, updates });
    setSelectedElement({ ...selectedElement, ...updates });
  };

  const updateLabel = (label: string) => {
    if (!selectedElement) return;
    setSelectedElement({ ...selectedElement, label });
  };

  const updateCommentaire = (commentaire: string) => {
    if (!selectedElement) return;
    setSelectedElement({ ...selectedElement, commentaire });
  };

  const saveLabel = () => {
    if (!selectedElement) return;
    updateElementMutation.mutate({ id: selectedElement.id, updates: { label: selectedElement.label } });
  };

  const saveCommentaire = () => {
    if (!selectedElement) return;
    updateElementMutation.mutate({ id: selectedElement.id, updates: { commentaire: selectedElement.commentaire } });
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
          Sélectionnez un type d'élément puis cliquez sur le plan pour le placer
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
          className="relative border-2 border-primary bg-background/50 cursor-crosshair"
          style={{
            width: `${Math.min(planWidth, 600)}px`,
            height: `${planHeight}px`,
          }}
          onClick={handlePlanClick}
        >
          {elements.map((element) => {
            const Icon = getElementIcon(element.type_element);
            return (
              <div
                key={element.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: `${element.position_x}%`,
                  top: `${element.position_y}%`,
                }}
                onClick={(e) => handleElementClick(element, e)}
              >
                <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedElement && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Éditer l'élément</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedElement(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Type</label>
              <p className="text-sm text-muted-foreground">{selectedElement.type_element}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Label</label>
              <Input
                value={selectedElement.label || ""}
                onChange={(e) => updateLabel(e.target.value)}
                onBlur={saveLabel}
                placeholder="Ex: Écran principal"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Commentaire</label>
              <Textarea
                value={selectedElement.commentaire || ""}
                onChange={(e) => updateCommentaire(e.target.value)}
                onBlur={saveCommentaire}
                placeholder="Commentaire optionnel..."
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Déplacement</label>
              <div className="grid grid-cols-3 gap-2 max-w-[150px]">
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveElement("up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveElement("left")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveElement("right")}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveElement("down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteElementMutation.mutate(selectedElement.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
