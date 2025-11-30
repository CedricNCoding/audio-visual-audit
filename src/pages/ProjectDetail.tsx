import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DoorOpen, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";

const ROOM_TYPOLOGIES = [
  "Huddle",
  "Réunion",
  "Direction",
  "Conseil",
  "Formation",
  "Auditorium",
  "Showroom",
];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    typology: "",
    package_id: "",
  });

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: rooms } = useQuery({
    queryKey: ["rooms", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: packages } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const createRoom = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: room, error } = await supabase
        .from("rooms")
        .insert([{
          ...data,
          project_id: projectId,
          package_id: data.package_id || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return room;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ["rooms", projectId] });
      toast.success("Salle créée avec succès");
      setIsDialogOpen(false);
      setFormData({ name: "", typology: "", package_id: "" });
      navigate(`/rooms/${room.id}`);
    },
    onError: (error: any) => {
      toast.error("Erreur : " + error.message);
    },
  });

  const duplicateRoom = useMutation({
    mutationFn: async (roomId: string) => {
      // Get original room data
      const { data: originalRoom, error: fetchError } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();
      
      if (fetchError) throw fetchError;

      // Create new room
      const { data: newRoom, error: roomError } = await supabase
        .from("rooms")
        .insert([{
          name: `${originalRoom.name} (copie)`,
          typology: originalRoom.typology,
          package_id: originalRoom.package_id,
          project_id: originalRoom.project_id,
        }])
        .select()
        .single();
      
      if (roomError) throw roomError;

      // Copy sources
      const { data: sources } = await supabase
        .from("sources")
        .select("*")
        .eq("room_id", roomId);
      
      if (sources && sources.length > 0) {
        await supabase.from("sources").insert(
          sources.map(s => ({ ...s, id: undefined, room_id: newRoom.id, created_at: undefined }))
        );
      }

      // Copy displays
      const { data: displays } = await supabase
        .from("displays")
        .select("*")
        .eq("room_id", roomId);
      
      if (displays && displays.length > 0) {
        await supabase.from("displays").insert(
          displays.map(d => ({ ...d, id: undefined, room_id: newRoom.id, created_at: undefined }))
        );
      }

      // Copy connectivity zones
      const { data: zones } = await supabase
        .from("connectivity_zones")
        .select("*")
        .eq("room_id", roomId);
      
      if (zones && zones.length > 0) {
        await supabase.from("connectivity_zones").insert(
          zones.map(z => ({ ...z, id: undefined, room_id: newRoom.id, created_at: undefined }))
        );
      }

      // Copy cables
      const { data: cables } = await supabase
        .from("cables")
        .select("*")
        .eq("room_id", roomId);
      
      if (cables && cables.length > 0) {
        await supabase.from("cables").insert(
          cables.map(c => ({ ...c, id: undefined, room_id: newRoom.id, created_at: undefined }))
        );
      }

      return newRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", projectId] });
      toast.success("Salle dupliquée avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la duplication : " + error.message);
    },
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{project?.client_name}</h2>
            {project?.site_name && (
              <p className="text-muted-foreground">{project.site_name}</p>
            )}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle salle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle salle</DialogTitle>
                <DialogDescription>
                  Ajoutez une salle à ce projet
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createRoom.mutate(formData);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la salle *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Salle 301"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="typology">Typologie</Label>
                  <Select
                    value={formData.typology}
                    onValueChange={(value) =>
                      setFormData({ ...formData, typology: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPOLOGIES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package">Package prédéfini (optionnel)</Label>
                  <Select
                    value={formData.package_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, package_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createRoom.isPending}>
                    {createRoom.isPending ? "Création..." : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {rooms && rooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DoorOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Aucune salle pour ce projet
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer la première salle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms?.map((room) => (
              <Card
                key={room.id}
                className="cursor-pointer hover:shadow-lg transition-shadow glass relative group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateRoom.mutate(room.id);
                  }}
                >
                  <Copy className="h-4 w-4 neon-blue" />
                </Button>
                <div onClick={() => navigate(`/rooms/${room.id}`)}>
                  <CardHeader>
                    <CardTitle className="neon-yellow">{room.name}</CardTitle>
                    {room.typology && (
                      <CardDescription>{room.typology}</CardDescription>
                    )}
                  </CardHeader>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
