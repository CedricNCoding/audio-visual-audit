import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Upload, Download } from "lucide-react";
import { toast } from "sonner";

interface PhotosManagerProps {
  roomId: string;
}

export const PhotosManager = ({ roomId }: PhotosManagerProps) => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

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

  // Generate signed URLs for all photos
  useEffect(() => {
    const generateSignedUrls = async () => {
      if (!photos || photos.length === 0) return;
      
      const urls: Record<string, string> = {};
      for (const photo of photos) {
        const { data, error } = await supabase.storage
          .from("room-photos")
          .createSignedUrl(`${roomId}/${photo.name}`, 3600); // 1 hour expiry
        
        if (!error && data) {
          urls[photo.name] = data.signedUrl;
        }
      }
      setPhotoUrls(urls);
    };

    generateSignedUrls();
  }, [photos, roomId]);

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

  const downloadPhoto = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("room-photos")
        .download(`${roomId}/${fileName}`);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Photo téléchargée");
    } catch (error: any) {
      toast.error("Erreur lors du téléchargement : " + error.message);
    }
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
              {photoUrls[photo.name] ? (
                <img
                  src={photoUrls[photo.name]}
                  alt={photo.name}
                  className="w-full h-48 object-cover rounded"
                />
              ) : (
                <div className="w-full h-48 bg-muted rounded flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Chargement...</span>
                </div>
              )}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => downloadPhoto(photo.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deletePhoto.mutate(photo.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
