import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

const SIGNAL_TYPES = [
  "Vidéo HDMI",
  "Vidéo HDBaseT",
  "Vidéo IP / AVoIP",
  "USB",
  "Audio analogique",
  "Audio numérique / Dante",
  "Réseau RJ45",
];

const TRANSPORT_TYPES = [
  "HDMI direct",
  "Extender HDMI",
  "HDBaseT",
  "Fibre",
  "RJ45",
  "XLR",
  "Jack",
  "Dante",
];

interface CablesManagerProps {
  roomId: string;
}

export const CablesManager = ({ roomId }: CablesManagerProps) => {
  const queryClient = useQueryClient();
  const [newCable, setNewCable] = useState({
    point_a: "",
    point_b: "",
    signal_type: "",
    transport: "",
    distance_m: 0,
    commentaire: "",
  });
  const [editingDistances, setEditingDistances] = useState<Record<string, number>>({});

  const { data: cables } = useQuery({
    queryKey: ["cables", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cables")
        .select("*")
        .eq("room_id", roomId)
        .order("id", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addCable = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cables").insert([{ ...newCable, room_id: roomId }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
      setNewCable({ point_a: "", point_b: "", signal_type: "", transport: "", distance_m: 0, commentaire: "" });
      toast.success("Liaison ajoutée");
    },
  });

  const deleteCable = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
      toast.success("Liaison supprimée");
    },
  });

  const { data: sources } = useQuery({
    queryKey: ["sources", roomId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sources").select("*").eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const { data: displays } = useQuery({
    queryKey: ["displays", roomId],
    queryFn: async () => {
      const { data, error } = await supabase.from("displays").select("*").eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const { data: sonorization } = useQuery({
    queryKey: ["room_sonorization", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_sonorization")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: connectivityZones } = useQuery({
    queryKey: ["connectivity_zones", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("connectivity_zones")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const generateBasicCables = useMutation({
    mutationFn: async () => {
      if (!sources?.length || !displays?.length) {
        throw new Error("Au moins une source et un diffuseur sont nécessaires");
      }

      // Check if cables already exist
      if (cables && cables.length > 0) {
        const confirm = window.confirm(
          "Des liaisons existent déjà. Voulez-vous ajouter des liaisons de base en plus ?"
        );
        if (!confirm) return;
      }

      const cablesToCreate: any[] = [];
      
      // ========== LOGIQUE VIDÉO ==========
      const videoSources = sources.filter(s => 
        !s.source_type.toLowerCase().includes("audio") &&
        !s.source_type.toLowerCase().includes("micro")
      );

      // ========== LOGIQUE SOURCES EN SALLE (CONNECTIVITY ZONES) ==========
      if (connectivityZones && connectivityZones.length > 0) {
        connectivityZones.forEach(zone => {
          const zoneSourceCount = (zone.hdmi_count || 0) + (zone.usbc_count || 0) + (zone.displayport_count || 0);
          
          if (zoneSourceCount > 0) {
            const zoneName = zone.zone_name;
            
            if (zoneSourceCount > 1) {
              // Plusieurs sources dans la zone -> Sélecteur local
              const selectorName = `Sélecteur local ${zoneName}`;
              
              // Liaisons sources zone -> sélecteur local
              if (zone.hdmi_count && zone.hdmi_count > 0) {
                for (let i = 0; i < zone.hdmi_count; i++) {
                  cablesToCreate.push({
                    room_id: roomId,
                    point_a: `HDMI ${zoneName} ${i + 1}`,
                    point_b: selectorName,
                    signal_type: "Vidéo HDMI",
                    transport: "HDMI direct",
                    distance_m: 2,
                    commentaire: `Source en salle vers sélecteur local`,
                  });
                }
              }
              if (zone.usbc_count && zone.usbc_count > 0) {
                for (let i = 0; i < zone.usbc_count; i++) {
                  cablesToCreate.push({
                    room_id: roomId,
                    point_a: `USB-C ${zoneName} ${i + 1}`,
                    point_b: selectorName,
                    signal_type: "Vidéo HDMI",
                    transport: "HDMI direct",
                    distance_m: 2,
                    commentaire: `Source en salle vers sélecteur local`,
                  });
                }
              }
              if (zone.displayport_count && zone.displayport_count > 0) {
                for (let i = 0; i < zone.displayport_count; i++) {
                  cablesToCreate.push({
                    room_id: roomId,
                    point_a: `DisplayPort ${zoneName} ${i + 1}`,
                    point_b: selectorName,
                    signal_type: "Vidéo HDMI",
                    transport: "HDMI direct",
                    distance_m: 2,
                    commentaire: `Source en salle vers sélecteur local`,
                  });
                }
              }
              
              // Liaison sélecteur local -> matrice ou diffuseur
              if (displays.length > 1 || videoSources.length > 0) {
                cablesToCreate.push({
                  room_id: roomId,
                  point_a: selectorName,
                  point_b: displays.length > 1 || videoSources.length > 1 ? "Matrice vidéo" : displays[0]?.display_type || "Diffuseur",
                  signal_type: "Vidéo HDMI",
                  transport: zone.distance_to_control_room_m && zone.distance_to_control_room_m > 5 ? "HDBaseT" : "HDMI direct",
                  distance_m: zone.distance_to_control_room_m || 10,
                  commentaire: `Liaison depuis sélecteur local ${zoneName}`,
                });
              }
            } else {
              // Une seule source dans la zone -> Direct
              const sourceType = zone.hdmi_count ? "HDMI" : zone.usbc_count ? "USB-C" : "DisplayPort";
              const sourceName = `${sourceType} ${zoneName}`;
              
              cablesToCreate.push({
                room_id: roomId,
                point_a: sourceName,
                point_b: displays.length > 1 || videoSources.length > 0 ? "Matrice vidéo" : displays[0]?.display_type || "Diffuseur",
                signal_type: "Vidéo HDMI",
                transport: zone.distance_to_control_room_m && zone.distance_to_control_room_m > 5 ? "HDBaseT" : "HDMI direct",
                distance_m: zone.distance_to_control_room_m || 10,
                commentaire: `Liaison directe depuis source en salle`,
              });
            }
          }
        });
      }
      
      if (videoSources.length === 1 && displays.length === 1) {
        // Cas 1: 1 source, 1 diffuseur -> Direct
        cablesToCreate.push({
          room_id: roomId,
          point_a: videoSources[0].source_type,
          point_b: displays[0].display_type,
          signal_type: "Vidéo HDMI",
          transport: "HDMI direct",
          distance_m: 5,
          commentaire: "Liaison directe générée automatiquement",
        });
      } else if (videoSources.length > 1 && displays.length === 1) {
        // Cas 2: Plusieurs sources, 1 diffuseur -> Sélecteur
        const selectorName = "Sélecteur vidéo";
        
        // Liaisons sources -> sélecteur
        videoSources.forEach(source => {
          cablesToCreate.push({
            room_id: roomId,
            point_a: source.source_type,
            point_b: selectorName,
            signal_type: "Vidéo HDMI",
            transport: "HDMI direct",
            distance_m: 3,
            commentaire: "Liaison vers sélecteur générée automatiquement",
          });
        });
        
        // Liaison sélecteur -> diffuseur
        cablesToCreate.push({
          room_id: roomId,
          point_a: selectorName,
          point_b: displays[0].display_type,
          signal_type: "Vidéo HDMI",
          transport: "HDMI direct",
          distance_m: 5,
          commentaire: "Liaison depuis sélecteur générée automatiquement",
        });
      } else if (videoSources.length > 1 && displays.length > 1) {
        // Cas 3: Plusieurs sources, plusieurs diffuseurs -> Matrice
        const matrixName = "Matrice vidéo";
        
        // Liaisons sources -> matrice
        videoSources.forEach(source => {
          cablesToCreate.push({
            room_id: roomId,
            point_a: source.source_type,
            point_b: matrixName,
            signal_type: "Vidéo HDMI",
            transport: "HDMI direct",
            distance_m: 3,
            commentaire: "Liaison vers matrice générée automatiquement",
          });
        });
        
        // Liaisons matrice -> diffuseurs
        displays.forEach(display => {
          cablesToCreate.push({
            room_id: roomId,
            point_a: matrixName,
            point_b: display.display_type,
            signal_type: "Vidéo HDMI",
            transport: "HDMI direct",
            distance_m: 5,
            commentaire: "Liaison depuis matrice générée automatiquement",
          });
        });
      } else if (videoSources.length === 1 && displays.length > 1) {
        // Cas 4: 1 source, plusieurs diffuseurs -> Distribution
        displays.forEach(display => {
          cablesToCreate.push({
            room_id: roomId,
            point_a: videoSources[0].source_type,
            point_b: display.display_type,
            signal_type: "Vidéo HDMI",
            transport: "HDMI direct",
            distance_m: 5,
            commentaire: "Distribution vidéo générée automatiquement",
          });
        });
      }

      // ========== LOGIQUE AUDIO ==========
      if (sonorization) {
        const audioSources: string[] = [];
        
        // Collecter les sources audio depuis sonorization
        if (sonorization.nb_micro_main_hf && sonorization.nb_micro_main_hf > 0) {
          audioSources.push("Micros main HF");
        }
        if (sonorization.nb_micro_cravate_hf && sonorization.nb_micro_cravate_hf > 0) {
          audioSources.push("Micros cravate HF");
        }
        if (sonorization.nb_micro_pupitre && sonorization.nb_micro_pupitre > 0) {
          audioSources.push("Micros pupitre");
        }
        if (sonorization.nb_micro_table && sonorization.nb_micro_table > 0) {
          audioSources.push("Micros table");
        }
        if (sonorization.nb_micro_plafond_beamforming && sonorization.nb_micro_plafond_beamforming > 0) {
          audioSources.push("Micros plafond beamforming");
        }
        
        // Ajouter sources PC/players
        const pcSources = sources.filter(s => 
          s.source_type.toLowerCase().includes("pc") ||
          s.source_type.toLowerCase().includes("ordinateur") ||
          s.source_type.toLowerCase().includes("player")
        );
        pcSources.forEach(s => audioSources.push(s.source_type + " (audio)"));

        if (audioSources.length > 0) {
          const hasMultipleZones = sonorization.diffusion_homogene || sonorization.diffusion_locale || sonorization.diffusion_orientee;
          
          if (audioSources.length > 1 || hasMultipleZones) {
            // Plusieurs sources ou zones -> DSP/Matrice audio
            const dspName = hasMultipleZones ? "Matrice audio / DSP multizone" : "DSP / Mixeur audio";
            
            // Liaisons sources -> DSP
            audioSources.forEach(source => {
              cablesToCreate.push({
                room_id: roomId,
                point_a: source,
                point_b: dspName,
                signal_type: sonorization.dante_souhaite ? "Audio numérique / Dante" : "Audio analogique",
                transport: sonorization.dante_souhaite ? "Dante" : "XLR",
                distance_m: 5,
                commentaire: "Liaison audio vers DSP générée automatiquement",
              });
            });
            
            // Liaison DSP -> Amplification
            cablesToCreate.push({
              room_id: roomId,
              point_a: dspName,
              point_b: "Amplification / Enceintes",
              signal_type: sonorization.dante_souhaite ? "Audio numérique / Dante" : "Audio analogique",
              transport: sonorization.dante_souhaite ? "Dante" : "XLR",
              distance_m: 10,
              commentaire: "Liaison DSP vers amplification générée automatiquement",
            });
          } else {
            // 1 source, 1 zone -> Direct
            cablesToCreate.push({
              room_id: roomId,
              point_a: audioSources[0],
              point_b: "Amplification / Enceintes",
              signal_type: "Audio analogique",
              transport: "XLR",
              distance_m: 8,
              commentaire: "Liaison audio directe générée automatiquement",
            });
          }
        }
      }

      if (cablesToCreate.length === 0) {
        throw new Error("Aucune liaison à générer avec la configuration actuelle");
      }

      const { error } = await supabase.from("cables").insert(cablesToCreate);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
      toast.success("Liaisons de base générées (vidéo + audio)");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => generateBasicCables.mutate()}
          variant="outline"
          className="gap-2"
          disabled={!sources?.length || !displays?.length}
        >
          <Wand2 className="h-4 w-4" />
          Générer les liaisons de base
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        <Select
          value={newCable.point_a}
          onValueChange={(value) => setNewCable({ ...newCable, point_a: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Point A" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="Matrice">Matrice</SelectItem>
            <SelectItem value="Sélecteur">Sélecteur</SelectItem>
            {sources?.map((source) => (
              <SelectItem key={source.id} value={source.source_type}>
                {source.source_type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newCable.point_b}
          onValueChange={(value) => setNewCable({ ...newCable, point_b: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Point B" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="Matrice">Matrice</SelectItem>
            <SelectItem value="Sélecteur">Sélecteur</SelectItem>
            {displays?.map((display) => (
              <SelectItem key={display.id} value={display.display_type}>
                {display.display_type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newCable.signal_type}
          onValueChange={(value) => setNewCable({ ...newCable, signal_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type signal" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {SIGNAL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newCable.transport}
          onValueChange={(value) => setNewCable({ ...newCable, transport: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Transport" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            {TRANSPORT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Distance (m)"
          value={newCable.distance_m || ""}
          onChange={(e) => setNewCable({ ...newCable, distance_m: parseFloat(e.target.value) || 0 })}
        />
        <Button onClick={() => addCable.mutate()} disabled={!newCable.point_a || !newCable.signal_type}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {cables?.map((cable) => (
        <Card key={cable.id} className="p-4">
          <div className="flex justify-between items-start mb-3">
            <p className="font-medium">
              {cable.point_a} → {cable.point_b}
            </p>
            <Button variant="ghost" size="icon" onClick={() => deleteCable.mutate(cable.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <Label className="text-xs">Type signal</Label>
              <Select
                value={cable.signal_type}
                onValueChange={async (value) => {
                  const { error } = await supabase
                    .from("cables")
                    .update({ signal_type: value })
                    .eq("id", cable.id);
                  if (!error) {
                    queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
                    toast.success("Type de signal mis à jour");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {SIGNAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Transport</Label>
              <Select
                value={cable.transport || ""}
                onValueChange={async (value) => {
                  const { error } = await supabase
                    .from("cables")
                    .update({ transport: value })
                    .eq("id", cable.id);
                  if (!error) {
                    queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
                    toast.success("Transport mis à jour");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {TRANSPORT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Distance (m)</Label>
              <Input
                type="number"
                value={editingDistances[cable.id] ?? cable.distance_m}
                onChange={(e) => {
                  const newDistance = parseFloat(e.target.value) || 0;
                  setEditingDistances(prev => ({ ...prev, [cable.id]: newDistance }));
                }}
                onBlur={async () => {
                  const newDistance = editingDistances[cable.id];
                  if (newDistance !== undefined && newDistance !== cable.distance_m) {
                    const { error } = await supabase
                      .from("cables")
                      .update({ distance_m: newDistance })
                      .eq("id", cable.id);
                    if (!error) {
                      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
                      toast.success("Distance mise à jour");
                    }
                  }
                  setEditingDistances(prev => {
                    const { [cable.id]: _, ...rest } = prev;
                    return rest;
                  });
                }}
              />
            </div>
            <div>
              <Label className="text-xs">Marge (m)</Label>
              <Input
                type="number"
                value={cable.distance_with_margin_m || cable.distance_m * 1.2}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
          {cable.commentaire && (
            <p className="text-xs text-muted-foreground mt-2">{cable.commentaire}</p>
          )}
          {cable.cable_recommendation && (
            <p className="text-sm text-primary mt-2">💡 {cable.cable_recommendation}</p>
          )}
        </Card>
      ))}
    </div>
  );
};
