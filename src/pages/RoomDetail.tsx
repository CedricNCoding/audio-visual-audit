import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Save, Trash2, Edit2, Info, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { RoomUsageForm } from "@/components/room/RoomUsageForm";
import { RoomEnvironmentForm } from "@/components/room/RoomEnvironmentForm";
import { RoomVisioForm } from "@/components/room/RoomVisioForm";
import { RoomSonorizationForm } from "@/components/room/RoomSonorizationForm";
import { SourcesManager } from "@/components/room/SourcesManager";
import { DisplaysManager } from "@/components/room/DisplaysManager";
import { ConnectivityManager } from "@/components/room/ConnectivityManager";
import { CablesManager } from "@/components/room/CablesManager";
import { PhotosManager } from "@/components/room/PhotosManager";
import { RoomSummary } from "@/components/room/RoomSummary";
import { StepNavigation } from "@/components/room/StepNavigation";
import { RoomRecap } from "@/components/room/RoomRecap";
import { EquipmentHelper } from "@/components/room/EquipmentHelper";

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

  const { data: roomSonorization } = useQuery({
    queryKey: ["room_sonorization", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_sonorization")
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

  const saveSonorization = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("room_sonorization")
        .upsert({ ...data, room_id: roomId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room_sonorization", roomId] });
      toast.success("Sonorisation sauvegardée");
    },
  });

  const [usageData, setUsageData] = useState(roomUsage || {});
  const [environmentData, setEnvironmentData] = useState(roomEnvironment || {});
  const [visioData, setVisioData] = useState(roomVisio || {});
  const [sonorizationData, setSonorizationData] = useState(roomSonorization || {});

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
    if (roomSonorization) setSonorizationData(roomSonorization);
  }, [roomSonorization]);

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
      await supabase.from("room_sonorization").delete().eq("room_id", roomId);
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
      case "sonorization":
        saveSonorization.mutate(sonorizationData);
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

  const isMobile = useIsMobile();
  const steps = ["usage", "environment", "sources", "displays", "sonorization", "visio", "cables", "photos", "summary"];
  const stepNames = isMobile 
    ? ["Usage", "Env.", "Sources", "Diff.", "Sono", "Visio", "Câbles", "Photos", "Résumé"]
    : ["Usage", "Environnement", "Sources", "Diffuseurs", "Sonorisation", "Visio", "Liaisons", "Photos", "Résumé"];
  const currentStepIndex = steps.indexOf(activeTab);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      handleSave();
      setActiveTab(steps[currentStepIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setActiveTab(steps[currentStepIndex - 1]);
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
          {["usage", "environment", "visio", "sonorization"].includes(activeTab) && (
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          )}
        </div>

        {/* Step Progress Indicator with motion */}
        <div className={`glass neon-border-yellow rounded-lg animate-panel-reveal ${isMobile ? 'sticky top-0 z-40 p-2 -mx-4' : 'p-3 mb-4'}`}>
          <div className={`flex items-center ${isMobile ? 'gap-1 overflow-x-auto scrollbar-hide px-2' : 'gap-1.5 flex-wrap'} min-w-0`}>
            {stepNames.map((name, index) => (
              <button
                key={name}
                onClick={() => setActiveTab(steps[index])}
                className={`flex items-center ${isMobile ? 'gap-1 px-1.5 py-1' : 'gap-1 px-2 py-1.5'} rounded-lg whitespace-nowrap flex-shrink-0
                  transition-all duration-200 ease-out
                  hover:scale-[1.02] active:scale-[0.98]
                  ${index === currentStepIndex 
                    ? "neon-border-blue bg-primary text-primary-foreground shadow-glow-cyan" 
                    : index < currentStepIndex 
                    ? "bg-primary/30 text-primary-foreground hover:bg-primary/40" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span className={`flex items-center justify-center ${isMobile ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]'} rounded-full transition-all duration-200 ${
                  index === currentStepIndex ? "bg-primary-foreground text-primary" : ""
                }`}>
                  {index + 1}
                </span>
                <span className={isMobile ? 'text-[10px]' : 'text-xs'}>{name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick access buttons */}
        {["displays", "sonorization", "visio"].includes(activeTab) && (
          <div className="flex gap-2 justify-end mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Aide au choix
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <EquipmentHelper typology={room?.typology} />
              </DialogContent>
            </Dialog>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">

          <TabsContent value="usage">
            <Card>
              <CardHeader>
                <CardTitle>Usage et contexte</CardTitle>
                <CardDescription>
                  Définissez l'utilisation et le contexte de la salle
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <RoomUsageForm
                  data={usageData}
                  onChange={setUsageData}
                />
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
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
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <RoomEnvironmentForm
                  data={environmentData}
                  onChange={setEnvironmentData}
                  roomId={roomId}
                />
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
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
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <RoomVisioForm
                  data={visioData}
                  onChange={setVisioData}
                />
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card className="glass neon-border-yellow">
              <CardHeader>
                <CardTitle className="neon-yellow">Sources & Connectique</CardTitle>
                <CardDescription>
                  Gérez les sources et la connectique de la salle
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 neon-blue">Sources en salle (Connectique)</h3>
                    <ConnectivityManager roomId={roomId!} />
                  </div>
                  
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold mb-3 neon-yellow">Sources en régie</h3>
                    <SourcesManager roomId={roomId!} />
                  </div>
                </div>
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
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
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <DisplaysManager roomId={roomId!} />
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sonorization">
            <Card>
              <CardHeader>
                <CardTitle>Sonorisation</CardTitle>
                <CardDescription>
                  Configuration de la sonorisation de la salle
                </CardDescription>
              </CardHeader>
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <RoomSonorizationForm
                  data={sonorizationData}
                  onChange={setSonorizationData}
                />
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
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
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <CablesManager roomId={roomId!} />
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
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
              <CardContent className={isMobile ? 'pb-20' : ''}>
                <PhotosManager roomId={roomId!} />
                <StepNavigation
                  currentStep={currentStepIndex + 1}
                  totalSteps={steps.length}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
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
