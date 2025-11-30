import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

interface RoomSummaryProps {
  roomId: string;
}

export const RoomSummary = ({ roomId }: RoomSummaryProps) => {
  const [exportText, setExportText] = useState("");
  const { data: room } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*, projects(*)")
        .eq("id", roomId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: roomUsage } = useQuery({
    queryKey: ["room_usage", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_usage")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: roomEnvironment } = useQuery({
    queryKey: ["room_environment", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_environment")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: roomVisio } = useQuery({
    queryKey: ["room_visio", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_visio")
        .select("*")
        .eq("room_id", roomId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: roomSonorization } = useQuery({
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

  const { data: sources } = useQuery({
    queryKey: ["sources", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const { data: displays } = useQuery({
    queryKey: ["displays", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("displays")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  const { data: cables } = useQuery({
    queryKey: ["cables", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cables")
        .select("*")
        .eq("room_id", roomId);
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

  const generateStructuredText = () => {
    let text = `═══════════════════════════════════════════════════════\n`;
    text += `       COMPTE RENDU TECHNIQUE AUDIOVISUEL\n`;
    text += `═══════════════════════════════════════════════════════\n\n`;
    text += `Salle ${room?.name || ""} – ${room?.typology || "N/A"} – ${roomUsage?.nombre_personnes || "?"} personnes\n\n`;

    // Section 1 – Projet
    text += `┌─────────────────────────────────────────────────────┐\n`;
    text += `│ Section 1 – PROJET                                  │\n`;
    text += `└─────────────────────────────────────────────────────┘\n`;
    text += `• Client : ${room?.projects?.client_name || "N/A"}\n`;
    text += `• Site : ${room?.projects?.site_name || "N/A"}\n`;
    text += `• Projet : ${room?.name || "N/A"}\n`;
    text += `• Service décideur : ${room?.projects?.decision_service || "N/A"} – Contact : ${room?.projects?.decision_contact || "N/A"}\n`;
    text += `• Date de décision prévue : ${room?.projects?.decision_date || "N/A"}\n\n`;

    // Section 2 – Usage et contexte
    text += `┌─────────────────────────────────────────────────────┐\n`;
    text += `│ Section 2 – USAGE ET CONTEXTE                       │\n`;
    text += `└─────────────────────────────────────────────────────┘\n`;
    if (roomUsage) {
      text += `• Usage principal : ${roomUsage.main_usage || "N/A"}\n`;
      text += `• Intensité d'usage : ${roomUsage.usage_intensity || "N/A"}\n`;
      text += `• Niveau de compétence utilisateurs : ${roomUsage.user_skill_level || "N/A"}\n`;
      text += `• Plateforme principale : ${roomUsage.platform_type || "N/A"}\n`;
      text += `• Réservation de salle : ${roomUsage.reservation_salle ? "Oui" : "Non"}\n`;
    }
    text += `\n`;

    // Section 3 – Environnement
    if (roomEnvironment) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 3 – ENVIRONNEMENT                           │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      text += `• Dimensions : ${roomEnvironment.length_m || "?"}m x ${roomEnvironment.width_m || "?"}m x ${roomEnvironment.height_m || "?"}m\n`;
      text += `• Murs : ${roomEnvironment.wall_material || "N/A"} – Sol : ${roomEnvironment.floor_material || "N/A"} – Plafond : ${roomEnvironment.ceiling_material || "N/A"}\n`;
      text += `• Plancher technique : ${roomEnvironment.has_raised_floor ? "Oui" : "Non"}\n`;
      text += `• Faux plafond technique : ${roomEnvironment.has_false_ceiling ? "Oui" : "Non"}\n`;
      text += `• Luminosité : ${roomEnvironment.brightness_level || "N/A"}\n`;
      text += `• Problèmes acoustiques : ${roomEnvironment.has_acoustic_issue ? "Oui" : "Non"}${roomEnvironment.acoustic_comment ? ` - ${roomEnvironment.acoustic_comment}` : ""}\n`;
      text += `\n`;
    }

    // Section 4 – Visio / Audio / Streaming
    if (roomVisio) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 4 – VISIO / AUDIO / STREAMING              │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      text += `• Visio nécessaire : ${roomVisio.visio_required ? "Oui" : "Non"}\n`;
      text += `• Besoin en streaming : ${roomVisio.streaming_enabled ? "Oui" : "Non"}\n`;
      text += `• Voir : ${roomVisio.need_to_see ? "Oui" : "Non"}\n`;
      text += `• Être vu : ${roomVisio.need_to_be_seen ? "Oui" : "Non"}\n`;
      text += `• Entendre : ${roomVisio.need_to_hear ? "Oui" : "Non"}\n`;
      text += `• Être entendu : ${roomVisio.need_to_be_heard ? "Oui" : "Non"}\n`;
      text += `• Caméras : ${roomVisio.camera_count || 0} x ${roomVisio.camera_types?.join(", ") || "N/A"}\n`;
      text += `• Micros : ${roomVisio.mic_count || 0} x ${roomVisio.mic_types?.join(", ") || "N/A"}\n`;
      if (roomVisio.streaming_enabled) {
        text += `• Streaming : ${roomVisio.streaming_type || "N/A"} sur ${roomVisio.streaming_platform || "N/A"} (complexité : ${roomVisio.streaming_complexity || "N/A"})\n`;
      }
      text += `\n`;
    }

    // Section 5 – Sources en régie
    if (sources && sources.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 5 – SOURCES EN RÉGIE                        │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      sources.forEach((s) => {
        text += `• ${s.quantity || 1} x ${s.source_type}\n`;
      });
      text += `\n`;
    }

    // Section 6 – Diffuseurs
    if (displays && displays.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 6 – DIFFUSEURS                              │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      displays.forEach((d) => {
        const sizeText = d.size_inches || (d.display_type === "Vidéoprojecteur" && d.base_ecran_cm ? 
          Math.round(Math.sqrt(Math.pow(d.base_ecran_cm, 2) + Math.pow(d.base_ecran_cm * 10 / 16, 2)) / 2.54) : "?");
        text += `• ${d.display_type} – ${sizeText}" – position : ${d.position || "N/A"} – distance spectateur : ${d.viewer_distance_m || "?"}m – hauteur bas écran : ${d.bottom_height_cm || "?"}cm\n`;
        if (d.display_type === "Vidéoprojecteur") {
          text += `  distance de projection : ${d.distance_projection_m || "?"}m – base écran : ${d.base_ecran_cm || "?"}cm\n`;
        }
      });
      text += `\n`;
    }

    // Section 7 – Sonorisation
    if (roomSonorization) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 7 – SONORISATION                            │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      text += `• Sonorisation d'ambiance : ${roomSonorization.ambiance_necessaire ? `Oui - ${roomSonorization.ambiance_type || "N/A"}` : "Non"}\n`;
      text += `• Sonorisation de puissance : ${roomSonorization.puissance_necessaire ? `Oui - ${roomSonorization.puissance_niveau || "N/A"}` : "Non"}\n`;
      text += `• Diffusion homogène : ${roomSonorization.diffusion_homogene ? `Oui - ${roomSonorization.type_diffusion?.join(", ") || "N/A"}` : "Non"}\n`;
      if (roomSonorization.renforcement_voix) {
        text += `• Renforcement voix : Oui - ${roomSonorization.nb_micros_renfort || 0} micros (${roomSonorization.types_micros_renfort?.join(", ") || "N/A"})${roomSonorization.mixage_multiple ? " - Mixage multiple" : ""}\n`;
      } else {
        text += `• Renforcement voix : Non\n`;
      }
      text += `• Acoustique : ${roomSonorization.objectif_acoustique || "N/A"}\n`;
      text += `• Retour sonore : ${roomSonorization.retour_necessaire ? `Oui - ${roomSonorization.retour_type || "N/A"}` : "Non"}\n`;
      text += `• Risque de larsen : ${roomSonorization.larsen_risque ? "Oui" : "Non"}\n`;
      if (roomSonorization.sources_audio_specifiques) {
        text += `• Sources audio spécifiques : ${roomSonorization.sources_audio_specifiques}\n`;
      }
      text += `• Traitement audio : DSP ${roomSonorization.dsp_necessaire ? "Oui" : "Non"} - Dante ${roomSonorization.dante_souhaite ? "Oui" : "Non"}\n`;
      text += `\n`;
    }

    // Section 8 – Connectique utilisateur
    if (connectivityZones && connectivityZones.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 8 – CONNECTIQUE UTILISATEUR                 │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      connectivityZones.forEach((zone) => {
        const parts = [];
        if (zone.hdmi_count > 0) parts.push(`${zone.hdmi_count} HDMI`);
        if (zone.usbc_count > 0) parts.push(`${zone.usbc_count} USB-C`);
        if (zone.displayport_count > 0) parts.push(`${zone.displayport_count} DP`);
        if (zone.rj45_count > 0) parts.push(`${zone.rj45_count} RJ45`);
        if (zone.usba_count > 0) parts.push(`${zone.usba_count} USB-A`);
        if (zone.power_230v_count > 0) parts.push(`${zone.power_230v_count} prises 230V`);
        text += `• ${zone.zone_name} : ${parts.join(", ")}`;
        if (zone.distance_to_control_room_m > 0) text += ` (distance vers régie : ${zone.distance_to_control_room_m}m)`;
        text += `\n`;
      });
      text += `\n`;
    }

    // Section 9 – Liaisons & câbles
    if (cables && cables.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 9 – LIAISONS & CÂBLES                       │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      cables.forEach((cable) => {
        text += `• ${cable.point_a} → ${cable.point_b} – ${cable.signal_type} – ${cable.distance_m}m (${cable.distance_with_margin_m}m avec marge) – ${cable.cable_recommendation}\n`;
      });
      text += `\n`;
    }

    // Section 10 – Synthèse
    text += `┌─────────────────────────────────────────────────────┐\n`;
    text += `│ Section 10 – SYNTHÈSE                               │\n`;
    text += `└─────────────────────────────────────────────────────┘\n`;
    
    // Calculate recommendation
    const sourcesCount = sources?.length || 0;
    const displaysCount = displays?.length || 0;
    let recommendation = "Distribution simple";
    if (sourcesCount > 1 && displaysCount === 1) {
      recommendation = "Sélecteur";
    } else if (sourcesCount > 1 && displaysCount > 1) {
      recommendation = "Matrice";
    }
    text += `• Recommandation gestion des signaux : ${recommendation}\n\n`;

    text += `═══════════════════════════════════════════════════════\n`;
    text += `          Fin du compte rendu technique\n`;
    text += `═══════════════════════════════════════════════════════\n`;

    return text;
  };

  const generateExportText = () => {
    const text = generateStructuredText();
    setExportText(text);
    toast.success("Texte structuré généré");
  };

  const copyToClipboard = () => {
    if (!exportText) {
      toast.error("Générez d'abord le texte structuré");
      return;
    }
    navigator.clipboard.writeText(exportText);
    toast.success("Texte copié dans le presse-papier");
  };

  const downloadTextFile = () => {
    if (!exportText) {
      toast.error("Générez d'abord le texte structuré");
      return;
    }
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compte-rendu-${room?.name || "salle"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Fichier texte téléchargé");
  };

  return (
    <div className="space-y-4">
      <Card className="glass neon-border-yellow p-6">
        <CardHeader>
          <CardTitle className="neon-yellow">Export texte structuré</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Texte d'export structuré</Label>
            <textarea
              className="w-full h-96 p-4 bg-background/50 border border-border rounded-lg text-sm font-mono"
              value={exportText}
              readOnly
              placeholder="Cliquez sur 'Générer texte structuré' pour créer le compte-rendu..."
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={generateExportText} className="flex-1">
              Générer texte structuré
            </Button>
            <Button onClick={downloadTextFile} variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Télécharger .txt
            </Button>
            <Button onClick={copyToClipboard} variant="secondary">
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
