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
    viewer_distance_m: 0,
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

  // Calculate recommended size based on viewer distance
  const calculateRecommendedSize = (distanceM: number): number => {
    if (!distanceM || distanceM <= 0) return 0;
    return Math.round(distanceM * 20);
  };

  const recommendedSize = calculateRecommendedSize(newDisplay.viewer_distance_m);
  const currentSize = newDisplay.display_type === "Vidéoprojecteur" && newDisplay.base_ecran_cm > 0
    ? calculateInchesFromBase(newDisplay.base_ecran_cm)
    : newDisplay.size_inches;

  const getSizeComment = (): string | null => {
    if (!recommendedSize || !currentSize) return null;
    if (currentSize < recommendedSize * 0.8) {
      return "Écran probablement sous-dimensionné";
    } else if (currentSize > recommendedSize * 1.5) {
      return "Écran très grand par rapport à la distance";
    }
    return "Taille d'écran cohérente";
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
      
      // Calculate recommended size and comment
      const recommendedSizeInches = displayData.viewer_distance_m > 0 
        ? calculateRecommendedSize(displayData.viewer_distance_m) 
        : null;
      const sizeComment = getSizeComment();
      
      // Ensure all optional fields have valid values (null if not set)
      const insertData: any = {
        room_id: roomId,
        display_type: displayData.display_type,
        position: displayData.position || null,
        size_inches: displayData.size_inches || null,
        distance_projection_m: displayData.distance_projection_m || null,
        base_ecran_cm: displayData.base_ecran_cm || null,
        viewer_distance_m: displayData.viewer_distance_m || null,
        recommended_size_inches: recommendedSizeInches,
        size_comparison_comment: sizeComment,
      };
      
      const { error } = await supabase
        .from("displays")
        .insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["displays", roomId] });
      setNewDisplay({ display_type: "", size_inches: 0, position: "", distance_projection_m: 0, base_ecran_cm: 0, viewer_distance_m: 0 });
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
      
      {/* Distance spectateur (pour tous les types) */}
      {newDisplay.display_type && (
        <div className="glass neon-border-blue p-4 rounded-lg space-y-4">
          <div className="space-y-2">
            <Label>Distance spectateur (m)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="Ex: 4.0"
              value={newDisplay.viewer_distance_m || ""}
              onChange={(e) => setNewDisplay({ ...newDisplay, viewer_distance_m: parseFloat(e.target.value) || 0 })}
            />
          </div>
          
          {recommendedSize > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-primary">
                <strong>💡 Suggestion de taille (indicative)</strong>
                <p className="text-muted-foreground mt-1">
                  Pour un recul de {newDisplay.viewer_distance_m} m, une diagonale d'environ <strong>{recommendedSize} pouces</strong> est recommandée pour un usage confort.
                </p>
              </div>
              
              {currentSize > 0 && (
                <div className="text-xs">
                  <span className={
                    getSizeComment() === "Taille d'écran cohérente" 
                      ? "text-green-400" 
                      : "text-yellow-400"
                  }>
                    {getSizeComment()}
                  </span>
                </div>
              )}
              
              {(!currentSize || currentSize === 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (newDisplay.display_type === "Vidéoprojecteur") {
                      // Pour VP, ajuster base_ecran_cm pour atteindre la taille recommandée
                      const targetBase = Math.round((recommendedSize * 2.54) / Math.sqrt(1 + (10/16)**2));
                      setNewDisplay({ ...newDisplay, base_ecran_cm: targetBase });
                    } else {
                      setNewDisplay({ ...newDisplay, size_inches: recommendedSize });
                    }
                  }}
                >
                  Ajuster à la recommandation
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      
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
