import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ConnectivityManagerProps {
  roomId: string;
}

export const ConnectivityManager = ({ roomId }: ConnectivityManagerProps) => {
  const queryClient = useQueryClient();
  const [newZone, setNewZone] = useState({
    zone_name: "",
    hdmi_count: 0,
    usbc_count: 0,
    displayport_count: 0,
    rj45_count: 0,
    usba_count: 0,
    power_230v_count: 0,
  });

  const { data: zones } = useQuery({
    queryKey: ["connectivity_zones", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connectivity_zones")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const addZone = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("connectivity_zones")
        .insert([{ ...newZone, room_id: roomId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectivity_zones", roomId] });
      setNewZone({ zone_name: "", hdmi_count: 0, usbc_count: 0, displayport_count: 0, rj45_count: 0, usba_count: 0, power_230v_count: 0 });
      toast.success("Zone ajoutée");
    },
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("connectivity_zones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectivity_zones", roomId] });
      toast.success("Zone supprimée");
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-4 border rounded-lg">
        <Input
          placeholder="Nom de la zone (ex: Table, Pupitre...)"
          value={newZone.zone_name}
          onChange={(e) => setNewZone({ ...newZone, zone_name: e.target.value })}
        />
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">HDMI</Label>
            <Input type="number" min="0" value={newZone.hdmi_count} onChange={(e) => setNewZone({ ...newZone, hdmi_count: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">USB-C</Label>
            <Input type="number" min="0" value={newZone.usbc_count} onChange={(e) => setNewZone({ ...newZone, usbc_count: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">RJ45</Label>
            <Input type="number" min="0" value={newZone.rj45_count} onChange={(e) => setNewZone({ ...newZone, rj45_count: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
        <Button onClick={() => addZone.mutate()} disabled={!newZone.zone_name} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Ajouter zone
        </Button>
      </div>
      {zones?.map((zone) => (
        <Card key={zone.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium mb-2">{zone.zone_name}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                {zone.hdmi_count > 0 && <p>HDMI: {zone.hdmi_count}</p>}
                {zone.usbc_count > 0 && <p>USB-C: {zone.usbc_count}</p>}
                {zone.rj45_count > 0 && <p>RJ45: {zone.rj45_count}</p>}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteZone.mutate(zone.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
