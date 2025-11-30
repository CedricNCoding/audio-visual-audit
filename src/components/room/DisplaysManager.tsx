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
  });

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
      const { error } = await supabase
        .from("displays")
        .insert([{ ...newDisplay, room_id: roomId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["displays", roomId] });
      setNewDisplay({ display_type: "", size_inches: 0, position: "" });
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
        <Input
          type="number"
          placeholder="Taille (pouces)"
          value={newDisplay.size_inches || ""}
          onChange={(e) => setNewDisplay({ ...newDisplay, size_inches: parseInt(e.target.value) || 0 })}
        />
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
        <Button onClick={() => addDisplay.mutate()} disabled={!newDisplay.display_type}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {displays?.map((display) => (
          <Card key={display.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{display.display_type} {display.size_inches}"</p>
              <p className="text-sm text-muted-foreground">{display.position}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteDisplay.mutate(display.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
