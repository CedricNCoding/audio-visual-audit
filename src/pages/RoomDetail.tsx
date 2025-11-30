import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Save, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { RoomUsageForm } from "@/components/room/RoomUsageForm";
import { RoomEnvironmentForm } from "@/components/room/RoomEnvironmentForm";
import { RoomVisioForm } from "@/components/room/RoomVisioForm";
import { SourcesManager } from "@/components/room/SourcesManager";
import { DisplaysManager } from "@/components/room/DisplaysManager";
import { ConnectivityManager } from "@/components/room/ConnectivityManager";
import { CablesManager } from "@/components/room/CablesManager";
import { PhotosManager } from "@/components/room/PhotosManager";
import { RoomSummary } from "@/components/room/RoomSummary";

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("usage");
  const [isEditingName, setIsEditingName] = useState(false);
  const [roomName, setRoomName] = useState("");

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

  // Update form data when queries complete
  useEffect(() => {
    if (roomUsage) setUsageData(roomUsage);
  }, [roomUsage]);

  useEffect(() => {
    if (roomEnvironment) setEnvironmentData(roomEnvironment);
  }, [roomEnvironment]);

  useEffect(() => {
    if (roomVisio) setVisioData(roomVisio);
  }, [roomVisio]);

  useEffect(() => {
    if (room) setRoomName(room.name);
  }, [room]);

  const updateRoomName = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from("rooms")
        .update({ name })
        .eq("id", roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setIsEditingName(false);
      toast.success("Nom de la salle mis à jour");
    },
  });

  const deleteRoom = useMutation({
    mutationFn: async () => {
      // Delete related data first
      await supabase.from("cables").delete().eq("room_id", roomId);
      await supabase.from("connectivity_zones").delete().eq("room_id", roomId);
      await supabase.from("displays").delete().eq("room_id", roomId);
      await supabase.from("sources").delete().eq("room_id", roomId);
      await supabase.from("room_visio").delete().eq("room_id", roomId);
      await supabase.from("room_environment").delete().eq("room_id", roomId);
      await supabase.from("room_usage").delete().eq("room_id", roomId);
      
      // Delete the room
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Salle supprimée");
      navigate(`/projects/${room?.project_id}`);
    },
  });

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

  const handleSaveName = () => {
    if (roomName && roomName !== room?.name) {
      updateRoomName.mutate(roomName);
    } else {
      setIsEditingName(false);
    }
  };

  const steps = ["usage", "environment", "visio", "sources", "displays", "connectivity", "cables", "photos", "summary"];
  const stepNames = ["Usage", "Environnement", "Visio", "Sources", "Diffuseurs", "Connectique", "Liaisons", "Photos", "Résumé"];
  const currentStepIndex = steps.indexOf(activeTab);

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
            {isEditingName ? (
              <div className="flex gap-2 items-center">
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="text-2xl font-bold"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>Sauvegarder</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>Annuler</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold">{room?.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingName(true)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <p className="text-muted-foreground">
              {room?.projects?.client_name} - {room?.typology || "Sans typologie"}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer la salle ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes les données liées à cette salle (sources, diffuseurs, connectique, liaisons) seront supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteRoom.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {["usage", "environment", "visio"].includes(activeTab) && (
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          )}
        </div>

        {/* Step Progress Indicator */}
        <div className="glass neon-border-yellow p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            {stepNames.map((name, index) => (
              <div key={name} className="flex-1 flex items-center">
                <button
                  onClick={() => setActiveTab(steps[index])}
                  className={`flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110 ${
                    index === currentStepIndex ? "neon-border-blue bg-primary text-primary-foreground" :
                    index < currentStepIndex ? "bg-primary/50 text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </button>
                {index < stepNames.length - 1 && (
                  <div className={`flex-1 h-0.5 ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {stepNames.map((name, index) => (
              <button
                key={name}
                onClick={() => setActiveTab(steps[index])}
                className="flex-1 text-center hover:text-foreground transition-colors cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="glass neon-border-yellow flex flex-wrap justify-start gap-2 h-auto p-2">
            <TabsTrigger value="usage" className="data-[state=active]:neon-border-blue">Usage</TabsTrigger>
            <TabsTrigger value="environment" className="data-[state=active]:neon-border-blue">Environnement</TabsTrigger>
            <TabsTrigger value="visio" className="data-[state=active]:neon-border-blue">Visio</TabsTrigger>
            <TabsTrigger value="sources" className="data-[state=active]:neon-border-blue">Sources</TabsTrigger>
            <TabsTrigger value="displays" className="data-[state=active]:neon-border-blue">Diffuseurs</TabsTrigger>
            <TabsTrigger value="connectivity" className="data-[state=active]:neon-border-blue">Connectique</TabsTrigger>
            <TabsTrigger value="cables" className="data-[state=active]:neon-border-blue">Liaisons</TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:neon-border-blue">Photos</TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:neon-border-blue">Résumé</TabsTrigger>
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
            <Card className="glass neon-border-yellow">
              <CardHeader>
                <CardTitle className="neon-yellow">Sources en régie</CardTitle>
                <CardDescription>
                  Gérez les sources de contenu en régie
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
            <Card className="glass neon-border-yellow">
              <CardHeader>
                <CardTitle className="neon-yellow">Liaisons & Câbles</CardTitle>
                <CardDescription>
                  Gérez les connexions et recommandations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CablesManager roomId={roomId!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photos">
            <Card className="glass neon-border-yellow">
              <CardHeader>
                <CardTitle className="neon-yellow">Photos & Plans</CardTitle>
                <CardDescription>
                  Téléchargez et annotez vos photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotosManager roomId={roomId!} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <RoomSummary roomId={roomId!} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default RoomDetail;
