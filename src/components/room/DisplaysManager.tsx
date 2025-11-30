import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const DISPLAY_TYPES = ["Moniteur", "Vidéoprojecteur", "LED", "Mur d'images", "Répétiteur"];
const POSITIONS = ["Face", "Latéral", "Fond"];

interface DisplaysManagerProps {
  roomId: string;
}

export const DisplaysManager = ({ roomId }: DisplaysManagerProps) => {
  const queryClient = useQueryClient();
  const [newDisplay, setNewDisplay] = useState({
    display_type: "",
    size_inches: 0,
    position: "",
    distance_projection_m: 0,
    base_ecran_cm: 0,
  });

  // Calculate size in inches from base_ecran_cm for vidéoprojecteur (16:10 ratio)
  const calculateInchesFromBase = (baseCm: number): number => {
    if (!baseCm || baseCm <= 0) return 0;
    const base = baseCm;
    const hauteur = base * 10 / 16;
    const diagonaleCm = Math.sqrt(base * base + hauteur * hauteur);
    const tailleInches = diagonaleCm / 2.54;
    return Math.round(tailleInches * 10) / 10; // Round to 1 decimal
  };

  const { data: displays } = useQuery({
    queryKey: ["displays", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("displays")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const addDisplay = useMutation({
    mutationFn: async () => {
      // Auto-calculate size_inches for vidéoprojecteur if not provided
      let displayData = { ...newDisplay };
      if (displayData.display_type === "Vidéoprojecteur" && displayData.base_ecran_cm > 0) {
        if (!displayData.size_inches || displayData.size_inches === 0) {
          displayData.size_inches = calculateInchesFromBase(displayData.base_ecran_cm);
        }
      }
      
      // Ensure all optional fields have valid values (null if not set)
      const insertData: any = {
        room_id: roomId,
        display_type: displayData.display_type,
        position: displayData.position || null,
        size_inches: displayData.size_inches || null,
        distance_projection_m: displayData.distance_projection_m || null,
        base_ecran_cm: displayData.base_ecran_cm || null,
      };
      
      const { error } = await supabase
        .from("displays")
        .insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["displays", roomId] });
      setNewDisplay({ display_type: "", size_inches: 0, position: "", distance_projection_m: 0, base_ecran_cm: 0 });
      toast.success("Diffuseur ajouté");
    },
  });

  const deleteDisplay = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("displays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["displays", roomId] });
      toast.success("Diffuseur supprimé");
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Select
          value={newDisplay.display_type}
          onValueChange={(value) => setNewDisplay({ ...newDisplay, display_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {DISPLAY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Ne pas afficher taille_pouces pour les vidéoprojecteurs */}
        {newDisplay.display_type !== "Vidéoprojecteur" && (
          <Input
            type="number"
            placeholder="Taille (pouces)"
            value={newDisplay.size_inches || ""}
            onChange={(e) => setNewDisplay({ ...newDisplay, size_inches: parseInt(e.target.value) || 0 })}
          />
        )}
        <Select
          value={newDisplay.position}
          onValueChange={(value) => setNewDisplay({ ...newDisplay, position: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            {POSITIONS.map((pos) => (
              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={() => addDisplay.mutate()} 
          disabled={!newDisplay.display_type || addDisplay.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {newDisplay.display_type === "Vidéoprojecteur" && (
        <div className="glass neon-border-yellow p-4 rounded-lg grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Distance de projection (m)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="Ex: 3.5"
              value={newDisplay.distance_projection_m || ""}
              onChange={(e) => setNewDisplay({ ...newDisplay, distance_projection_m: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Base de l'écran (cm)</Label>
            <Input
              type="number"
              placeholder="Ex: 120"
              value={newDisplay.base_ecran_cm || ""}
              onChange={(e) => setNewDisplay({ ...newDisplay, base_ecran_cm: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {displays?.map((display) => {
          const calculatedInches = display.display_type === "Vidéoprojecteur" && display.base_ecran_cm 
            ? calculateInchesFromBase(display.base_ecran_cm) 
            : null;
          
          return (
            <Card key={display.id} className="p-4 flex justify-between items-center glass">
              <div>
                <p className="font-medium">
                  {display.display_type}
                  {display.display_type === "Vidéoprojecteur" && calculatedInches
                    ? ` ${calculatedInches}"`
                    : display.size_inches
                    ? ` ${display.size_inches}"`
                    : ""}
                </p>
                <p className="text-sm text-muted-foreground">{display.position}</p>
                {display.display_type === "Vidéoprojecteur" && (display.distance_projection_m || display.base_ecran_cm) && (
                  <p className="text-xs text-primary">
                    {display.distance_projection_m && `Distance: ${display.distance_projection_m}m`}
                    {display.distance_projection_m && display.base_ecran_cm && " • "}
                    {display.base_ecran_cm && `Base: ${display.base_ecran_cm}cm`}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteDisplay.mutate(display.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
