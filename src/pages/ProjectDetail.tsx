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
import { Plus, DoorOpen, ArrowLeft } from "lucide-react";
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
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <CardHeader>
                  <CardTitle>{room.name}</CardTitle>
                  {room.typology && (
                    <CardDescription>{room.typology}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ProjectDetail;
