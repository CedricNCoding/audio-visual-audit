import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoomVisioData {
  visio_required?: boolean;
  visio_platform?: string;
  need_to_see?: boolean;
  need_to_be_seen?: boolean;
  need_to_hear?: boolean;
  need_to_be_heard?: boolean;
  camera_count?: number;
  camera_types?: string[];
  mic_count?: number;
  mic_types?: string[];
  streaming_enabled?: boolean;
  streaming_type?: string;
  streaming_platform?: string;
  streaming_complexity?: string;
}

interface RoomVisioFormProps {
  data: RoomVisioData;
  onChange: (data: RoomVisioData) => void;
}

export const RoomVisioForm = ({ data, onChange }: RoomVisioFormProps) => {
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

  const updateField = (field: keyof RoomVisioData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addType = (field: "camera_types" | "mic_types", type: string) => {
    const current = data[field] || [];
    if (!current.includes(type)) {
      updateField(field, [...current, type]);
    }
  };

  const removeType = (field: "camera_types" | "mic_types", type: string) => {
    const current = data[field] || [];
    updateField(
      field,
      current.filter((t) => t !== type)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="visio_required"
          checked={data.visio_required || false}
          onCheckedChange={(checked) => updateField("visio_required", checked)}
        />
        <label htmlFor="visio_required" className="text-sm cursor-pointer font-medium">
          Visio nécessaire
        </label>
      </div>

      {data.visio_required && (
        <>
          <div className="space-y-2">
            <Label>Plateforme visio</Label>
            <Select
              value={data.visio_platform || ""}
              onValueChange={(value) => updateField("visio_platform", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teams Room">Microsoft Teams Room</SelectItem>
                <SelectItem value="Zoom Room">Zoom Room</SelectItem>
                <SelectItem value="Meet">Google Meet</SelectItem>
                <SelectItem value="BYOD">BYOD</SelectItem>
                <SelectItem value="Hybride">Hybride</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">Besoins</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="see"
                  checked={data.need_to_see || false}
                  onCheckedChange={(checked) => updateField("need_to_see", checked)}
                />
                <label htmlFor="see" className="text-sm cursor-pointer">Voir</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="be_seen"
                  checked={data.need_to_be_seen || false}
                  onCheckedChange={(checked) => updateField("need_to_be_seen", checked)}
                />
                <label htmlFor="be_seen" className="text-sm cursor-pointer">Être vu</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hear"
                  checked={data.need_to_hear || false}
                  onCheckedChange={(checked) => updateField("need_to_hear", checked)}
                />
                <label htmlFor="hear" className="text-sm cursor-pointer">Entendre</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="be_heard"
                  checked={data.need_to_be_heard || false}
                  onCheckedChange={(checked) => updateField("need_to_be_heard", checked)}
                />
                <label htmlFor="be_heard" className="text-sm cursor-pointer">Être entendu</label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nombre de caméras</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.camera_count || 0}
                  onChange={(e) => updateField("camera_count", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Types de caméras</Label>
                <Select onValueChange={(value) => addType("camera_types", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameraTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {(data.camera_types || []).map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {type}
                      <button
                        onClick={() => removeType("camera_types", type)}
                        className="hover:bg-destructive/20 rounded-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Nombre de micros</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.mic_count || 0}
                  onChange={(e) => updateField("mic_count", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Types de micros</Label>
                <Select onValueChange={(value) => addType("mic_types", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {micTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2">
                  {(data.mic_types || []).map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {type}
                      <button
                        onClick={() => removeType("mic_types", type)}
                        className="hover:bg-destructive/20 rounded-sm"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="streaming"
            checked={data.streaming_enabled || false}
            onCheckedChange={(checked) => updateField("streaming_enabled", checked)}
          />
          <label htmlFor="streaming" className="text-sm cursor-pointer font-medium">
            Besoin en streaming
          </label>
        </div>

        {data.streaming_enabled && (
          <div className="grid gap-4 md:grid-cols-3 pl-6">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={data.streaming_type || ""}
                onValueChange={(value) => updateField("streaming_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live uniquement</SelectItem>
                  <SelectItem value="live+record">Live + Enregistrement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plateforme</Label>
              <Input
                value={data.streaming_platform || ""}
                onChange={(e) => updateField("streaming_platform", e.target.value)}
                placeholder="Ex: YouTube, Vimeo..."
              />
            </div>
            <div className="space-y-2">
              <Label>Complexité</Label>
              <Select
                value={data.streaming_complexity || ""}
                onValueChange={(value) => updateField("streaming_complexity", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="régie">Régie complète</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
