import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Shield, UserX, UserCheck, Image, Folder, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const queryClient = useQueryClient();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
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

  // Fetch all users (admin only)
  const { data: allUsers } = useQuery({
    queryKey: ["all_users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch user roles (admin only)
  const { data: userRoles } = useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all rooms with their projects for photo context (admin only)
  const { data: allRooms } = useQuery({
    queryKey: ["all_rooms_for_photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, name, projects(client_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch all photos from storage (admin only)
  const { data: allPhotos, refetch: refetchPhotos } = useQuery({
    queryKey: ["all_photos"],
    queryFn: async () => {
      // List all folders (room IDs) in the bucket
      const { data: folders, error: foldersError } = await supabase.storage
        .from("room-photos")
        .list("", { limit: 1000 });
      
      if (foldersError) throw foldersError;
      
      // For each folder, list files
      const allFiles: { roomId: string; fileName: string; fullPath: string }[] = [];
      
      for (const folder of folders || []) {
        if (folder.id) {
          const { data: files, error: filesError } = await supabase.storage
            .from("room-photos")
            .list(folder.name, { limit: 100 });
          
          if (!filesError && files) {
            for (const file of files) {
              if (file.name && !file.id) continue; // skip .emptyFolderPlaceholder
              allFiles.push({
                roomId: folder.name,
                fileName: file.name,
                fullPath: `${folder.name}/${file.name}`,
              });
            }
          }
        }
      }
      
      return allFiles;
    },
    enabled: isAdmin,
  });

  // Fetch AI settings (admin only)
  const { data: aiSettingsData } = useQuery({
    queryKey: ["ai_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: isAdmin,
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
    onError: (error: any) => {
      toast.error("Erreur: " + (error.message || "Accès refusé"));
    },
  });

  const setUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // First, delete all existing roles for this user
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;

      // If the new role is not "user" (default), add the role
      if (newRole !== "user") {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole as any });
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Rôle mis à jour");
    },
    onError: (error: any) => {
      toast.error("Erreur: " + (error.message || "Impossible de modifier le rôle"));
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Delete profile (will cascade to user_roles due to FK)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all_users"] });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Utilisateur supprimé");
    },
    onError: (error: any) => {
      toast.error("Erreur: " + (error.message || "Impossible de supprimer l'utilisateur"));
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (fullPath: string) => {
      const { error } = await supabase.storage
        .from("room-photos")
        .remove([fullPath]);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchPhotos();
      toast.success("Photo supprimée");
    },
    onError: (error: any) => {
      toast.error("Erreur: " + (error.message || "Impossible de supprimer la photo"));
    },
  });

  const [adminPhotoUrls, setAdminPhotoUrls] = useState<Record<string, string>>({});

  // Generate signed URLs for admin photo management
  useEffect(() => {
    const generateSignedUrls = async () => {
      if (!allPhotos || allPhotos.length === 0) return;
      
      const urls: Record<string, string> = {};
      for (const photo of allPhotos) {
        const { data, error } = await supabase.storage
          .from("room-photos")
          .createSignedUrl(photo.fullPath, 3600); // 1 hour expiry
        
        if (!error && data) {
          urls[photo.fullPath] = data.signedUrl;
        }
      }
      setAdminPhotoUrls(urls);
    };

    if (isAdmin) {
      generateSignedUrls();
    }
  }, [allPhotos, isAdmin]);

  const getPhotoUrl = (fullPath: string) => {
    return adminPhotoUrls[fullPath] || "";
  };

  const getRoomName = (roomId: string) => {
    const room = allRooms?.find((r) => r.id === roomId);
    if (room) {
      const project = room.projects as any;
      return `${room.name} (${project?.client_name || "Sans projet"})`;
    }
    return roomId;
  };

  const isUserAdmin = (userId: string) => {
    return userRoles?.some((r) => r.user_id === userId && r.role === "admin");
  };

  const isUserBureauEtude = (userId: string) => {
    return userRoles?.some((r) => r.user_id === userId && (r.role as string) === "bureau_etude");
  };

  const getUserRole = (userId: string): string => {
    if (isUserAdmin(userId)) return "admin";
    if (isUserBureauEtude(userId)) return "bureau_etude";
    return "user";
  };

  if (adminLoading) {
    return (
      <AppLayout title="Paramètres">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Paramètres">
      <div className="space-y-6">
        {/* Admin-only sections */}
        {isAdmin && (
          <>
            {/* User Management */}
            <Card className="glass neon-border-yellow">
              <CardHeader>
                <CardTitle className="neon-yellow flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Gestion des Utilisateurs
                </CardTitle>
                <CardDescription>
                  Gérez les utilisateurs et leurs rôles (Admin uniquement)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {allUsers?.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded glass flex-wrap gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{user.full_name || "Sans nom"}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        {isUserAdmin(user.id) && (
                          <Badge variant="default" className="bg-primary">
                            Admin
                          </Badge>
                        )}
                        {isUserBureauEtude(user.id) && (
                          <Badge variant="secondary" className="bg-accent/20 text-accent border-accent">
                            Bureau d'Étude
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Select
                          value={getUserRole(user.id)}
                          onValueChange={(value) =>
                            setUserRole.mutate({ userId: user.id, newRole: value })
                          }
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="bureau_etude">Bureau d'Étude</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'utilisateur ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. L'utilisateur {user.email} et
                                toutes ses données seront supprimés.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser.mutate(user.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Settings - Admin only */}
            <Card className="glass neon-border-yellow">
              <CardHeader>
                <CardTitle className="neon-yellow">Paramètres IA</CardTitle>
                <CardDescription>
                  Configurez l'intelligence artificielle pour l'analyse des salles (Admin uniquement)
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

            {/* Camera Types - Admin only */}
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
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-2 rounded glass"
                    >
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

            {/* Microphone Types - Admin only */}
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
                    <div
                      key={type.id}
                      className="flex items-center justify-between p-2 rounded glass"
                    >
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

            {/* Photos Management - Admin only */}
            <Card className="glass neon-border-yellow">
              <CardHeader>
                <CardTitle className="neon-yellow flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Gestion des Photos
                </CardTitle>
                <CardDescription>
                  Visualisez et supprimez les photos de toutes les salles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allPhotos && allPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allPhotos.map((photo) => (
                      <div key={photo.fullPath} className="relative group">
                        <img
                          src={getPhotoUrl(photo.fullPath)}
                          alt={photo.fileName}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                          <p className="text-xs text-center text-white truncate w-full">
                            {getRoomName(photo.roomId)}
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la photo ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. La photo sera définitivement supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePhoto.mutate(photo.fullPath)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune photo dans le système</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Non-admin message */}
        {!isAdmin && (
          <Card className="glass neon-border-yellow">
            <CardHeader>
              <CardTitle className="neon-yellow">Accès restreint</CardTitle>
              <CardDescription>
                Les paramètres de l'application sont réservés aux administrateurs.
                Contactez un administrateur si vous avez besoin de modifier les paramètres.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Settings;
