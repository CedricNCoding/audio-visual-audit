import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Panel, InputField } from "@/components/design-system";

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
    <div className="space-y-6 animate-fade-in-up">
      {/* Section Visio principale */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '0ms' }}>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="visio_required"
              checked={data.visio_required || false}
              onCheckedChange={(checked) => updateField("visio_required", checked)}
              className="data-[state=checked]:bg-neon-yellow data-[state=checked]:border-neon-yellow"
            />
            <label htmlFor="visio_required" className="text-sm cursor-pointer font-medium text-foreground">
              Visioconférence nécessaire
            </label>
          </div>
        </div>
      </Panel>

      {data.visio_required && (
        <>
          {/* Section Plateforme et besoins */}
          <Panel variant="default" neonBorder="cyan" className="animate-panel-reveal" style={{ animationDelay: '40ms' }}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neon-cyan drop-shadow-[0_0_8px_hsl(var(--neon-cyan)/0.4)]">
                Configuration visio
              </h3>
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Plateforme visio</Label>
                <Select
                  value={data.visio_platform || ""}
                  onValueChange={(value) => updateField("visio_platform", value)}
                >
                  <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
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

            </div>
          </Panel>

          {/* Section Caméras et Micros */}
          <Panel variant="default" neonBorder="yellow" className="animate-panel-reveal" style={{ animationDelay: '80ms' }}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neon-yellow drop-shadow-[0_0_8px_hsl(var(--neon-yellow)/0.4)]">
                Équipements audio/vidéo
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                {/* Caméras */}
                <div className="space-y-4">
                  <InputField
                    label="Nombre de caméras"
                    type="number"
                    min={0}
                    value={data.camera_count || 0}
                    onChange={(e) => updateField("camera_count", parseInt(e.target.value) || 0)}
                    focusGlow="yellow"
                  />
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Types de caméras</Label>
                    <Select onValueChange={(value) => addType("camera_types", value)}>
                      <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-yellow/50 focus:shadow-glow-yellow transition-all">
                        <SelectValue placeholder="Ajouter un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cameraTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(data.camera_types || []).map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="gap-1 bg-glass-medium border border-neon-yellow/30 text-neon-yellow animate-pop-in"
                        >
                          {type}
                          <button
                            onClick={() => removeType("camera_types", type)}
                            className="hover:bg-destructive/20 rounded-sm transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Micros */}
                <div className="space-y-4">
                  <InputField
                    label="Nombre de micros"
                    type="number"
                    min={0}
                    value={data.mic_count || 0}
                    onChange={(e) => updateField("mic_count", parseInt(e.target.value) || 0)}
                    focusGlow="cyan"
                  />
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Types de micros</Label>
                    <Select onValueChange={(value) => addType("mic_types", value)}>
                      <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
                        <SelectValue placeholder="Ajouter un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {micTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(data.mic_types || []).map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="gap-1 bg-glass-medium border border-neon-cyan/30 text-neon-cyan animate-pop-in"
                        >
                          {type}
                          <button
                            onClick={() => removeType("mic_types", type)}
                            className="hover:bg-destructive/20 rounded-sm transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </>
      )}

      {/* Section Streaming */}
      <Panel variant="default" className="animate-panel-reveal" style={{ animationDelay: '120ms' }}>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-glass-subtle border border-glass-border/50 hover:border-accent/20 transition-all">
            <Checkbox
              id="streaming"
              checked={data.streaming_enabled || false}
              onCheckedChange={(checked) => updateField("streaming_enabled", checked)}
              className="data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
            />
            <label htmlFor="streaming" className="text-sm cursor-pointer font-medium text-foreground">
              Besoin en streaming
            </label>
          </div>

          {data.streaming_enabled && (
            <div className="grid gap-4 md:grid-cols-3 pt-2 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Type</Label>
                <Select
                  value={data.streaming_type || ""}
                  onValueChange={(value) => updateField("streaming_type", value)}
                >
                  <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">Live uniquement</SelectItem>
                    <SelectItem value="live+record">Live + Enregistrement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <InputField
                label="Plateforme"
                value={data.streaming_platform || ""}
                onChange={(e) => updateField("streaming_platform", e.target.value)}
                placeholder="Ex: YouTube, Vimeo..."
                focusGlow="cyan"
              />
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Complexité</Label>
                <Select
                  value={data.streaming_complexity || ""}
                  onValueChange={(value) => updateField("streaming_complexity", value)}
                >
                  <SelectTrigger className="bg-glass-light border-glass-border hover:border-accent/30 focus:border-neon-cyan/50 focus:shadow-glow-cyan transition-all">
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
      </Panel>
    </div>
  );
};
