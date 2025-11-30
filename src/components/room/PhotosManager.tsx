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
      // Refresh photos list
      queryClient.invalidateQueries({ queryKey: ["room-photos", roomId] });
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

      <div className="text-muted-foreground text-center py-8">
        Aucune photo pour le moment
      </div>
    </div>
  );
};
