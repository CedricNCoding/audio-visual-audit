import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { RoomUsageForm } from "@/components/room/RoomUsageForm";
import { RoomEnvironmentForm } from "@/components/room/RoomEnvironmentForm";
import { RoomVisioForm } from "@/components/room/RoomVisioForm";
import { SourcesManager } from "@/components/room/SourcesManager";
import { DisplaysManager } from "@/components/room/DisplaysManager";
import { ConnectivityManager } from "@/components/room/ConnectivityManager";
import { CablesManager } from "@/components/room/CablesManager";

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("usage");

  const { data: room } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*, projects(*)")
        .eq("id", roomId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: roomUsage } = useQuery({
    queryKey: ["room_usage", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_usage")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: roomEnvironment } = useQuery({
    queryKey: ["room_environment", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_environment")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: roomVisio } = useQuery({
    queryKey: ["room_visio", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_visio")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const saveUsage = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("room_usage")
        .upsert({ ...data, room_id: roomId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room_usage", roomId] });
      toast.success("Usage sauvegardé");
    },
  });

  const saveEnvironment = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("room_environment")
        .upsert({ ...data, room_id: roomId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room_environment", roomId] });
      toast.success("Environnement sauvegardé");
    },
  });

  const saveVisio = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("room_visio")
        .upsert({ ...data, room_id: roomId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room_visio", roomId] });
      toast.success("Visio/Streaming sauvegardé");
    },
  });

  const [usageData, setUsageData] = useState(roomUsage || {});
  const [environmentData, setEnvironmentData] = useState(roomEnvironment || {});
  const [visioData, setVisioData] = useState(roomVisio || {});

  const handleSave = () => {
    switch (activeTab) {
      case "usage":
        saveUsage.mutate(usageData);
        break;
      case "environment":
        saveEnvironment.mutate(environmentData);
        break;
      case "visio":
        saveVisio.mutate(visioData);
        break;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/projects/${room?.project_id}`)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{room?.name}</h2>
            <p className="text-muted-foreground">
              {room?.projects?.client_name} - {room?.typology || "Sans typologie"}
            </p>
          </div>
          {["usage", "environment", "visio"].includes(activeTab) && (
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="environment">Environnement</TabsTrigger>
            <TabsTrigger value="visio">Visio</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="displays">Diffuseurs</TabsTrigger>
            <TabsTrigger value="connectivity">Connectique</TabsTrigger>
            <TabsTrigger value="cables">Liaisons</TabsTrigger>
          </TabsList>

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage et contexte</CardTitle>
                <CardDescription>
                  Définissez l'utilisation et le contexte de la salle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomUsageForm
                  data={usageData}
                  onChange={setUsageData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment">
            <Card>
              <CardHeader>
                <CardTitle>Environnement physique</CardTitle>
                <CardDescription>
                  Caractéristiques physiques de la salle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomEnvironmentForm
                  data={environmentData}
                  onChange={setEnvironmentData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visio">
            <Card>
              <CardHeader>
                <CardTitle>Visio & Streaming</CardTitle>
                <CardDescription>
                  Configuration visioconférence et streaming
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RoomVisioForm
                  data={visioData}
                  onChange={setVisioData}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader>
                <CardTitle>Sources</CardTitle>
                <CardDescription>
                  Gérez les sources de contenu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SourcesManager roomId={roomId!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="displays">
            <Card>
              <CardHeader>
                <CardTitle>Diffuseurs</CardTitle>
                <CardDescription>
                  Gérez les écrans et projecteurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DisplaysManager roomId={roomId!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connectivity">
            <Card>
              <CardHeader>
                <CardTitle>Connectique utilisateur</CardTitle>
                <CardDescription>
                  Zones de connectique et prises
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConnectivityManager roomId={roomId!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cables">
            <Card>
              <CardHeader>
                <CardTitle>Liaisons & Câbles</CardTitle>
                <CardDescription>
                  Gérez les connexions et recommandations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CablesManager roomId={roomId!} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RoomDetail;
