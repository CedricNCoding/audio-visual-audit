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

const SOURCE_TYPES = [
  "PC fixe",
  "Laptop",
  "Player signage",
  "Sans-fil",
  "Codec",
  "Régie",
  "Autre",
];

interface SourcesManagerProps {
  roomId: string;
}

export const SourcesManager = ({ roomId }: SourcesManagerProps) => {
  const queryClient = useQueryClient();
  const [newSource, setNewSource] = useState({ source_type: "", quantity: 1 });

  const { data: sources } = useQuery({
    queryKey: ["sources", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .eq("room_id", roomId);
      
      if (error) throw error;
      return data;
    },
  });

  const addSource = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("sources")
        .insert([{ ...newSource, room_id: roomId }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", roomId] });
      setNewSource({ source_type: "", quantity: 1 });
      toast.success("Source ajoutée");
    },
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sources")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", roomId] });
      toast.success("Source supprimée");
    },
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold neon-yellow">Sources en régie</h3>
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label>Type de source</Label>
          <Select
            value={newSource.source_type}
            onValueChange={(value) => setNewSource({ ...newSource, source_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-24 space-y-2">
          <Label>Quantité</Label>
          <Input
            type="number"
            min="1"
            value={newSource.quantity}
            onChange={(e) => setNewSource({ ...newSource, quantity: parseInt(e.target.value) || 1 })}
          />
        </div>
        <Button
          onClick={() => addSource.mutate()}
          disabled={!newSource.source_type || addSource.isPending}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {sources?.map((source) => (
          <Card key={source.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{source.source_type}</p>
                <p className="text-sm text-muted-foreground">Quantité: {source.quantity}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteSource.mutate(source.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
