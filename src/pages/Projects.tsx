import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, FolderOpen, Calendar, Trash2, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Projects = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    site_name: "",
    site_address: "",
    building_name: "",
    contact_name: "",
    decision_service: "",
    decision_contact: "",
    decision_date: "",
    comments: "",
    parking_utilitaire: false,
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: project, error } = await supabase
        .from("projects")
        .insert([{ ...data, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet créé avec succès");
      setIsDialogOpen(false);
      setFormData({
        client_name: "",
        site_name: "",
        site_address: "",
        building_name: "",
        contact_name: "",
        decision_service: "",
        decision_contact: "",
        decision_date: "",
        comments: "",
        parking_utilitaire: false,
      });
      navigate(`/projects/${project.id}`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création : " + error.message);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      const { error: roomsError } = await supabase
        .from("rooms")
        .delete()
        .eq("project_id", projectId);
      
      if (roomsError) throw roomsError;

      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (projectError) throw projectError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Projet supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression : " + error.message);
    },
  });

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mes Projets">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h2 className="text-4xl font-bold tracking-tight font-display text-gradient-yellow">
              Projets
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">
              Gérez vos relevés techniques audiovisuels
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 shadow-neon-yellow">
                <Plus className="h-5 w-5" />
                Nouveau projet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau projet</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du projet
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createProject.mutate(formData);
                }}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client *</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) =>
                        setFormData({ ...formData, client_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site</Label>
                    <Input
                      id="site_name"
                      value={formData.site_name}
                      onChange={(e) =>
                        setFormData({ ...formData, site_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_address">Adresse du chantier</Label>
                  <Input
                    id="site_address"
                    value={formData.site_address}
                    onChange={(e) =>
                      setFormData({ ...formData, site_address: e.target.value })
                    }
                    placeholder="Ex: 123 rue de la Paix, 75001 Paris"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="building_name">Bâtiment</Label>
                  <Input
                    id="building_name"
                    value={formData.building_name}
                    onChange={(e) =>
                      setFormData({ ...formData, building_name: e.target.value })
                    }
                    placeholder="Ex: Bâtiment A, Tour principale..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="decision_service">Service décideur</Label>
                    <Input
                      id="decision_service"
                      value={formData.decision_service}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          decision_service: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="decision_contact">Contact décideur</Label>
                    <Input
                      id="decision_contact"
                      value={formData.decision_contact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          decision_contact: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="decision_date">Date de décision</Label>
                  <Input
                    id="decision_date"
                    type="date"
                    value={formData.decision_date}
                    onChange={(e) =>
                      setFormData({ ...formData, decision_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comments">Commentaires</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="parking_utilitaire"
                    checked={formData.parking_utilitaire}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, parking_utilitaire: checked as boolean })
                    }
                  />
                  <label htmlFor="parking_utilitaire" className="text-sm cursor-pointer">
                    Stationnement utilitaire possible (hauteur 2m)
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "Création..." : "Créer le projet"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {projects && projects.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-transparent animate-fade-in-up stagger-2">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                <FolderOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center text-lg mb-6">
                Aucun projet pour le moment
              </p>
              <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Créer mon premier projet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project, index) => (
              <Card
                key={project.id}
                className={`cursor-pointer hover-lift group relative animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
              >
                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hover:bg-destructive/20 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Supprimer ce projet et toutes ses salles ?")) {
                      deleteProject.mutate(project.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div onClick={() => navigate(`/projects/${project.id}`)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="neon-yellow text-xl line-clamp-1">
                      {project.client_name}
                    </CardTitle>
                    {project.site_name && (
                      <CardDescription className="flex items-center gap-2 line-clamp-1">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        {project.site_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.site_address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-accent" />
                        <span className="line-clamp-1">{project.site_address}</span>
                      </div>
                    )}
                    {project.decision_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span>
                          Décision: {new Date(project.decision_date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Projects;
