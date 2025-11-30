import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const queryClient = useQueryClient();
  const [newCameraType, setNewCameraType] = useState("");
  const [newMicType, setNewMicType] = useState("");
  const [aiSettings, setAiSettings] = useState({
    provider: "openai",
    model_name: "gpt-4.1-2025-04-14",
    api_key: "",
    max_hdmi_m: 5,
    max_hdbaset_m: 40,
  });

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

  // Fetch AI settings
  const { data: aiSettingsData } = useQuery({
    queryKey: ["ai_settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  useEffect(() => {
    if (aiSettingsData) {
      setAiSettings({
        provider: aiSettingsData.provider || "openai",
        model_name: aiSettingsData.model_name || "gpt-4.1-2025-04-14",
        api_key: aiSettingsData.api_key || "",
        max_hdmi_m: aiSettingsData.max_hdmi_m || 5,
        max_hdbaset_m: aiSettingsData.max_hdbaset_m || 40,
      });
    }
  }, [aiSettingsData]);

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

  const saveAiSettings = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("ai_settings")
        .upsert({
          user_id: user.id,
          provider: aiSettings.provider,
          model_name: aiSettings.model_name,
          api_key: aiSettings.api_key,
          max_hdmi_m: aiSettings.max_hdmi_m,
          max_hdbaset_m: aiSettings.max_hdbaset_m,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_settings"] });
      toast.success("Paramètres IA sauvegardés");
    },
  });

  return (
    <AppLayout title="Paramètres">
      <div className="space-y-6">
        <Card className="glass neon-border-yellow">
          <CardHeader>
            <CardTitle className="neon-yellow">Paramètres IA</CardTitle>
            <CardDescription>
              Configurez l'intelligence artificielle pour l'analyse des salles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modèle IA</Label>
              <Select
                value={aiSettings.model_name}
                onValueChange={(value) =>
                  setAiSettings({ ...aiSettings, model_name: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4.1-2025-04-14">GPT-4.1 (Recommandé)</SelectItem>
                  <SelectItem value="gpt-5-2025-08-07">GPT-5 (Flagship)</SelectItem>
                  <SelectItem value="gpt-5-mini-2025-08-07">GPT-5 Mini (Rapide)</SelectItem>
                  <SelectItem value="o3-2025-04-16">O3 (Raisonnement)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Clé API OpenAI</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={aiSettings.api_key}
                onChange={(e) =>
                  setAiSettings({ ...aiSettings, api_key: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Distance max HDMI (m)</Label>
                <Input
                  type="number"
                  value={aiSettings.max_hdmi_m}
                  onChange={(e) =>
                    setAiSettings({
                      ...aiSettings,
                      max_hdmi_m: parseFloat(e.target.value) || 5,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Distance max HDBaseT (m)</Label>
                <Input
                  type="number"
                  value={aiSettings.max_hdbaset_m}
                  onChange={(e) =>
                    setAiSettings({
                      ...aiSettings,
                      max_hdbaset_m: parseFloat(e.target.value) || 40,
                    })
                  }
                />
              </div>
            </div>

            <Button onClick={() => saveAiSettings.mutate()} className="w-full">
              Sauvegarder les paramètres IA
            </Button>
          </CardContent>
        </Card>

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
