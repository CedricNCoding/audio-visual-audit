import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface PhotosManagerProps {
  roomId: string;
}

export const PhotosManager = ({ roomId }: PhotosManagerProps) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: photos } = useQuery({
    queryKey: ["room-photos", roomId],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("room-photos")
        .list(roomId);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const fileName = `${roomId}/${Date.now()}_${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("room-photos")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      toast.success("Photo téléchargée avec succès");
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["room-photos", roomId] });
    } catch (error: any) {
      toast.error("Erreur lors du téléchargement : " + error.message);
    }
  };

  const deletePhoto = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from("room-photos")
        .remove([`${roomId}/${fileName}`]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-photos", roomId] });
      toast.success("Photo supprimée");
    },
  });

  const getPhotoUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from("room-photos")
      .getPublicUrl(`${roomId}/${fileName}`);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      <div className="glass neon-border-yellow p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold neon-yellow">Photos & Plans</h3>
        <div className="flex gap-4 items-end">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="flex-1 text-sm text-foreground"
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="bg-secondary hover:bg-secondary/80"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: L'éditeur d'annotations sera disponible prochainement
        </p>
      </div>

      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card key={photo.name} className="p-2 glass relative group">
              <img
                src={getPhotoUrl(photo.name)}
                alt={photo.name}
                className="w-full h-48 object-cover rounded"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deletePhoto.mutate(photo.name)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2 truncate">
                {photo.name}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center py-8">
          Aucune photo pour le moment
        </div>
      )}
    </div>
  );
};
