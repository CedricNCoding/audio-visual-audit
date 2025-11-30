import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const queryClient = useQueryClient();
  const [newCameraType, setNewCameraType] = useState("");
  const [newMicType, setNewMicType] = useState("");

  const { data: cameraTypes } = useQuery({
    queryKey: ["camera_types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("camera_types").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: micTypes } = useQuery({
    queryKey: ["microphone_types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("microphone_types").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const addCameraType = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("camera_types").insert([{ name }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["camera_types"] });
      setNewCameraType("");
      toast.success("Type de caméra ajouté");
    },
  });

  const deleteCameraType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("camera_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["camera_types"] });
      toast.success("Type de caméra supprimé");
    },
  });

  const addMicType = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("microphone_types").insert([{ name }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microphone_types"] });
      setNewMicType("");
      toast.success("Type de micro ajouté");
    },
  });

  const deleteMicType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("microphone_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["microphone_types"] });
      toast.success("Type de micro supprimé");
    },
  });

  return (
    <AppLayout title="Paramètres">
      <div className="space-y-6">
        <Card className="glass neon-border-yellow">
          <CardHeader>
            <CardTitle className="neon-yellow">Types de Caméras</CardTitle>
            <CardDescription>
              Gérez les types de caméras disponibles dans les formulaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nouveau type de caméra"
                value={newCameraType}
                onChange={(e) => setNewCameraType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCameraType) {
                    addCameraType.mutate(newCameraType);
                  }
                }}
              />
              <Button 
                onClick={() => addCameraType.mutate(newCameraType)}
                disabled={!newCameraType}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {cameraTypes?.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-2 rounded glass">
                  <span>{type.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCameraType.mutate(type.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass neon-border-blue">
          <CardHeader>
            <CardTitle className="neon-blue">Types de Microphones</CardTitle>
            <CardDescription>
              Gérez les types de microphones disponibles dans les formulaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nouveau type de micro"
                value={newMicType}
                onChange={(e) => setNewMicType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newMicType) {
                    addMicType.mutate(newMicType);
                  }
                }}
              />
              <Button 
                onClick={() => addMicType.mutate(newMicType)}
                disabled={!newMicType}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {micTypes?.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-2 rounded glass">
                  <span>{type.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMicType.mutate(type.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
