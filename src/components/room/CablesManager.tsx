import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SIGNAL_TYPES = ["HDMI", "USB", "DisplayPort", "RJ45", "Audio"];

interface CablesManagerProps {
  roomId: string;
}

export const CablesManager = ({ roomId }: CablesManagerProps) => {
  const queryClient = useQueryClient();
  const [newCable, setNewCable] = useState({
    point_a: "",
    point_b: "",
    signal_type: "",
    distance_m: 0,
  });

  const { data: cables } = useQuery({
    queryKey: ["cables", roomId],
    queryFn: async () => {
      const { data, error } = await supabase.from("cables").select("*").eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const addCable = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cables").insert([{ ...newCable, room_id: roomId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
      setNewCable({ point_a: "", point_b: "", signal_type: "", distance_m: 0 });
      toast.success("Liaison ajoutée");
    },
  });

  const deleteCable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
      toast.success("Liaison supprimée");
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-5">
        <Input placeholder="Point A" value={newCable.point_a} onChange={(e) => setNewCable({ ...newCable, point_a: e.target.value })} />
        <Input placeholder="Point B" value={newCable.point_b} onChange={(e) => setNewCable({ ...newCable, point_b: e.target.value })} />
        <Select value={newCable.signal_type} onValueChange={(value) => setNewCable({ ...newCable, signal_type: value })}>
          <SelectTrigger><SelectValue placeholder="Signal" /></SelectTrigger>
          <SelectContent>{SIGNAL_TYPES.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
        </Select>
        <Input type="number" placeholder="Distance (m)" value={newCable.distance_m || ""} onChange={(e) => setNewCable({ ...newCable, distance_m: parseFloat(e.target.value) || 0 })} />
        <Button onClick={() => addCable.mutate()} disabled={!newCable.point_a || !newCable.signal_type}><Plus className="h-4 w-4" /></Button>
      </div>
      {cables?.map((cable) => (
        <Card key={cable.id} className="p-4 flex justify-between items-start">
          <div>
            <p className="font-medium">{cable.point_a} → {cable.point_b}</p>
            <p className="text-sm text-muted-foreground">{cable.signal_type} • {cable.distance_m}m (marge: {cable.distance_with_margin_m}m)</p>
            <p className="text-sm text-primary mt-1">💡 {cable.cable_recommendation}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => deleteCable.mutate(cable.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </Card>
      ))}
    </div>
  );
};
