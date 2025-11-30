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
import { Plus, FolderOpen, Calendar, Trash2 } from "lucide-react";
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
    contact_name: "",
    decision_service: "",
    decision_contact: "",
    decision_date: "",
    comments: "",
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
        contact_name: "",
        decision_service: "",
        decision_contact: "",
        decision_date: "",
        comments: "",
      });
      navigate(`/projects/${project.id}`);
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la création : " + error.message);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      // Delete all rooms in this project first
      const { error: roomsError } = await supabase
        .from("rooms")
        .delete()
        .eq("project_id", projectId);
      
      if (roomsError) throw roomsError;

      // Then delete the project
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
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Mes Projets">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projets</h2>
            <p className="text-muted-foreground">
              Gérez vos relevés techniques audiovisuels
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
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
                className="space-y-4"
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
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "Création..." : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {projects && projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-4">
                Aucun projet pour le moment
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier projet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow glass relative group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Supprimer ce projet et toutes ses salles ?")) {
                      deleteProject.mutate(project.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <div onClick={() => navigate(`/projects/${project.id}`)}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1 neon-yellow">{project.client_name}</CardTitle>
                    {project.site_name && (
                      <CardDescription className="line-clamp-1">
                        {project.site_name}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {project.decision_date && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
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
