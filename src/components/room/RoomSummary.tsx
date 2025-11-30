import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIAnalysisResults } from "@/components/ai/AIAnalysisResults";

interface RoomSummaryProps {
  roomId: string;
}

export const RoomSummary = ({ roomId }: RoomSummaryProps) => {
  const queryClient = useQueryClient();
  const [exportText, setExportText] = useState("");
  const [notionStyleReport, setNotionStyleReport] = useState("");
  const [aiAnalysisData, setAiAnalysisData] = useState<any>(null);
  const [showAiResults, setShowAiResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      
      // Type général
      if (roomSonorization.type_sonorisation) {
        text += `• Type de sonorisation : ${roomSonorization.type_sonorisation}\n`;
      }
      
      // Diffusion
      const diffusionTypes = [];
      if (roomSonorization.diffusion_homogene) diffusionTypes.push("Homogène");
      if (roomSonorization.diffusion_orientee) diffusionTypes.push("Orientée");
      if (roomSonorization.diffusion_locale) diffusionTypes.push("Locale");
      if (diffusionTypes.length > 0) {
        text += `• Diffusion : ${diffusionTypes.join(", ")}\n`;
      }
      
      // Renforcement voix
      if (roomSonorization.renforcement_voix) {
        text += `• Renforcement voix : Oui\n`;
        const micros = [];
        if (roomSonorization.nb_micro_main_hf > 0) micros.push(`${roomSonorization.nb_micro_main_hf} micro main HF`);
        if (roomSonorization.nb_micro_cravate_hf > 0) micros.push(`${roomSonorization.nb_micro_cravate_hf} micro cravate HF`);
        if (roomSonorization.nb_micro_serre_tete_hf > 0) micros.push(`${roomSonorization.nb_micro_serre_tete_hf} micro serre-tête HF`);
        if (roomSonorization.nb_micro_pupitre > 0) micros.push(`${roomSonorization.nb_micro_pupitre} micro pupitre`);
        if (roomSonorization.nb_micro_plafond_beamforming > 0) micros.push(`${roomSonorization.nb_micro_plafond_beamforming} micro plafond beamforming`);
        if (roomSonorization.nb_micro_table > 0) micros.push(`${roomSonorization.nb_micro_table} micro de table`);
        if (micros.length > 0) {
          text += `  Micros : ${micros.join(", ")}\n`;
        }
        if (roomSonorization.mixage_multiple) {
          text += `  Mixage multiple : Oui\n`;
        }
      } else {
        text += `• Renforcement voix : Non\n`;
      }
      
      // Retour sonore
      text += `• Retour sonore : ${roomSonorization.retour_necessaire ? `Oui - ${roomSonorization.retour_type || "N/A"}` : "Non"}\n`;
      
      // Acoustique
      if (roomSonorization.acoustique_niveau) {
        text += `• Acoustique : ${roomSonorization.acoustique_niveau}\n`;
      }
      
      // Sources audio spécifiques
      if (roomSonorization.sources_audio_specifiques) {
        text += `• Sources audio spécifiques : ${roomSonorization.sources_audio_specifiques}\n`;
      }
      
      // Traitement audio
      const traitements = [];
      if (roomSonorization.dsp_necessaire) traitements.push("DSP");
      if (roomSonorization.dante_souhaite) traitements.push("Dante");
      if (roomSonorization.anti_larsen) traitements.push("Anti-larsen");
      if (traitements.length > 0) {
        text += `• Traitement audio : ${traitements.join(", ")}\n`;
      }
      
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

  const generateNotionStyleReport = useCallback(() => {
    if (!room) return "";

    let md = "";
    
    // Titre principal
    md += `# 📋 ${room.name || "Salle"} – ${room.typology || "N/A"}\n\n`;
    
    // Sous-titre projet
    if (room.projects) {
      md += `**Projet:** ${room.projects.client_name}`;
      if (room.projects.site_name) md += ` – Site: ${room.projects.site_name}`;
      md += `\n\n`;
    }

    // Usage & Contexte
    md += `## 🎯 Usage & Contexte\n\n`;
    if (roomUsage) {
      if (roomUsage.nombre_personnes) md += `- **Capacité:** ${roomUsage.nombre_personnes} personnes\n`;
      if (roomUsage.main_usage) md += `- **Usage principal:** ${roomUsage.main_usage}\n`;
      if (roomUsage.usage_intensity) md += `- **Intensité d'usage:** ${roomUsage.usage_intensity}\n`;
      if (roomUsage.user_skill_level) md += `- **Niveau utilisateurs:** ${roomUsage.user_skill_level}\n`;
      if (roomUsage.platform_type) md += `- **Plateforme:** ${roomUsage.platform_type}\n`;
      md += `- **Réservation salle:** ${roomUsage.reservation_salle ? "Oui" : "Non"}\n`;
    }
    md += `\n`;

    // Géométrie & Matériaux
    md += `## 📐 Géométrie & Matériaux\n\n`;
    if (roomEnvironment) {
      const dims = [];
      if (roomEnvironment.length_m) dims.push(`${roomEnvironment.length_m}m`);
      if (roomEnvironment.width_m) dims.push(`${roomEnvironment.width_m}m`);
      if (roomEnvironment.height_m) dims.push(`${roomEnvironment.height_m}m`);
      if (dims.length > 0) md += `- **Dimensions:** ${dims.join(" × ")}\n`;
      
      if (roomEnvironment.wall_material) md += `- **Murs:** ${roomEnvironment.wall_material}\n`;
      if (roomEnvironment.floor_material) md += `- **Sol:** ${roomEnvironment.floor_material}\n`;
      if (roomEnvironment.ceiling_material) md += `- **Plafond:** ${roomEnvironment.ceiling_material}\n`;
      md += `- **Plancher technique:** ${roomEnvironment.has_raised_floor ? "Oui" : "Non"}\n`;
      md += `- **Faux plafond technique:** ${roomEnvironment.has_false_ceiling ? "Oui" : "Non"}\n`;
      if (roomEnvironment.brightness_level) md += `- **Luminosité:** ${roomEnvironment.brightness_level}\n`;
    }
    md += `\n`;

    // Sonorisation
    md += `## 🔊 Sonorisation\n\n`;
    if (roomSonorization) {
      if (roomSonorization.type_sonorisation) md += `- **Type:** ${roomSonorization.type_sonorisation}\n`;
      
      const diffusionTypes = [];
      if (roomSonorization.diffusion_homogene) diffusionTypes.push("Homogène");
      if (roomSonorization.diffusion_orientee) diffusionTypes.push("Orientée");
      if (roomSonorization.diffusion_locale) diffusionTypes.push("Locale");
      if (diffusionTypes.length > 0) md += `- **Diffusion:** ${diffusionTypes.join(", ")}\n`;
      
      if (roomSonorization.renforcement_voix) {
        md += `- **Renforcement voix:** Oui\n`;
        const micros = [];
        if (roomSonorization.nb_micro_main_hf > 0) micros.push(`${roomSonorization.nb_micro_main_hf} main HF`);
        if (roomSonorization.nb_micro_cravate_hf > 0) micros.push(`${roomSonorization.nb_micro_cravate_hf} cravate HF`);
        if (roomSonorization.nb_micro_serre_tete_hf > 0) micros.push(`${roomSonorization.nb_micro_serre_tete_hf} serre-tête HF`);
        if (roomSonorization.nb_micro_pupitre > 0) micros.push(`${roomSonorization.nb_micro_pupitre} pupitre`);
        if (roomSonorization.nb_micro_plafond_beamforming > 0) micros.push(`${roomSonorization.nb_micro_plafond_beamforming} plafond beamforming`);
        if (roomSonorization.nb_micro_table > 0) micros.push(`${roomSonorization.nb_micro_table} table`);
        if (micros.length > 0) md += `  - Micros: ${micros.join(", ")}\n`;
        if (roomSonorization.mixage_multiple) md += `  - Mixage multiple\n`;
      } else {
        md += `- **Renforcement voix:** Non\n`;
      }
      
      md += `- **Retour sonore:** ${roomSonorization.retour_necessaire ? `Oui (${roomSonorization.retour_type || "N/A"})` : "Non"}\n`;
      if (roomSonorization.acoustique_niveau) md += `- **Acoustique:** ${roomSonorization.acoustique_niveau}\n`;
      
      const traitements = [];
      if (roomSonorization.dsp_necessaire) traitements.push("DSP");
      if (roomSonorization.dante_souhaite) traitements.push("Dante");
      if (roomSonorization.anti_larsen) traitements.push("Anti-larsen");
      if (traitements.length > 0) md += `- **Traitement audio:** ${traitements.join(", ")}\n`;
    }
    md += `\n`;

    // Visio / Streaming
    md += `## 📹 Visio / Streaming\n\n`;
    if (roomVisio) {
      md += `- **Visioconférence:** ${roomVisio.visio_required ? "Oui" : "Non"}\n`;
      if (roomVisio.visio_platform) md += `  - Plateforme: ${roomVisio.visio_platform}\n`;
      if (roomVisio.camera_count > 0) {
        md += `- **Caméras:** ${roomVisio.camera_count}`;
        if (roomVisio.camera_types && roomVisio.camera_types.length > 0) {
          md += ` (${roomVisio.camera_types.join(", ")})`;
        }
        md += `\n`;
      }
      if (roomVisio.mic_count > 0) {
        md += `- **Micros visio:** ${roomVisio.mic_count}`;
        if (roomVisio.mic_types && roomVisio.mic_types.length > 0) {
          md += ` (${roomVisio.mic_types.join(", ")})`;
        }
        md += `\n`;
      }
      md += `- **Streaming:** ${roomVisio.streaming_enabled ? "Oui" : "Non"}\n`;
      if (roomVisio.streaming_enabled && roomVisio.streaming_platform) {
        md += `  - Plateforme: ${roomVisio.streaming_platform}\n`;
      }
    }
    md += `\n`;

    // Sources & Diffuseurs
    md += `## 🖥️ Sources & Diffuseurs\n\n`;
    if (sources && sources.length > 0) {
      md += `### Sources\n\n`;
      sources.forEach((s) => {
        md += `- ${s.quantity || 1}× ${s.source_type}\n`;
      });
      md += `\n`;
    }
    if (displays && displays.length > 0) {
      md += `### Diffuseurs\n\n`;
      displays.forEach((d) => {
        let sizeText = "";
        if (d.display_type === "Vidéoprojecteur" && d.base_ecran_cm) {
          const calculated = Math.round(Math.sqrt(Math.pow(d.base_ecran_cm, 2) + Math.pow(d.base_ecran_cm * 10 / 16, 2)) / 2.54 * 10) / 10;
          sizeText = `${calculated}" (base: ${d.base_ecran_cm}cm)`;
        } else if (d.size_inches) {
          sizeText = `${d.size_inches}"`;
        }
        md += `- ${d.display_type}`;
        if (sizeText) md += ` – ${sizeText}`;
        if (d.position) md += ` – ${d.position}`;
        md += `\n`;
        if (d.display_type === "Vidéoprojecteur" && d.distance_projection_m) {
          md += `  - Distance projection: ${d.distance_projection_m}m\n`;
        }
      });
      md += `\n`;
    }

    // Connectique utilisateur
    if (connectivityZones && connectivityZones.length > 0) {
      md += `## 🔌 Connectique utilisateur\n\n`;
      connectivityZones.forEach((zone) => {
        md += `### ${zone.zone_name}\n\n`;
        const parts = [];
        if (zone.hdmi_count > 0) parts.push(`${zone.hdmi_count} HDMI`);
        if (zone.usbc_count > 0) parts.push(`${zone.usbc_count} USB-C`);
        if (zone.displayport_count > 0) parts.push(`${zone.displayport_count} DisplayPort`);
        if (zone.rj45_count > 0) parts.push(`${zone.rj45_count} RJ45`);
        if (zone.usba_count > 0) parts.push(`${zone.usba_count} USB-A`);
        if (zone.power_230v_count > 0) parts.push(`${zone.power_230v_count} prises 230V`);
        if (parts.length > 0) md += `- ${parts.join(", ")}\n`;
        if (zone.distance_to_control_room_m) md += `- Distance vers régie: ${zone.distance_to_control_room_m}m\n`;
        md += `\n`;
      });
    }

    // Liaisons & Câbles
    if (cables && cables.length > 0) {
      md += `## 🔗 Liaisons & Câbles\n\n`;
      cables.forEach((cable) => {
        md += `- **${cable.point_a}** → **${cable.point_b}**\n`;
        md += `  - ${cable.signal_type} – ${cable.distance_m}m`;
        if (cable.distance_with_margin_m) md += ` (${cable.distance_with_margin_m}m avec marge)`;
        md += `\n`;
        if (cable.cable_recommendation) md += `  - Recommandation: ${cable.cable_recommendation}\n`;
        md += `\n`;
      });
    }

    // Analyse IA
    if (room.resume_technique_ia || room.warnings_ia || room.critical_errors_ia) {
      md += `## 🤖 Analyse IA\n\n`;
      
      if (room.critical_errors_ia && room.critical_errors_ia.length > 0) {
        md += `### ⚠️ Erreurs critiques\n\n`;
        room.critical_errors_ia.forEach((error: string) => {
          md += `- ❌ ${error}\n`;
        });
        md += `\n`;
      }
      
      if (room.warnings_ia && room.warnings_ia.length > 0) {
        md += `### ⚡ Avertissements\n\n`;
        room.warnings_ia.forEach((warning: string) => {
          md += `- ⚠️ ${warning}\n`;
        });
        md += `\n`;
      }
      
      if (room.audio_config_ia) {
        md += `### 🎵 Configuration audio IA\n\n`;
        const audioConfig = room.audio_config_ia as any;
        if (audioConfig.type_sonorisation) md += `- Type: ${audioConfig.type_sonorisation}\n`;
        if (audioConfig.ambiance?.active) md += `- Ambiance: ${audioConfig.ambiance.description}\n`;
        if (audioConfig.puissance?.active) md += `- Puissance: ${audioConfig.puissance.niveau}\n`;
        md += `\n`;
      }
    }

    return md;
  }, [room, sources, displays, roomUsage, roomEnvironment, roomVisio, roomSonorization, connectivityZones, cables]);

  const downloadNotionStyleReport = () => {
    if (!notionStyleReport) {
      toast.error("Le compte rendu n'est pas encore généré");
      return;
    }
    const blob = new Blob([notionStyleReport], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Compte-rendu-${room?.name || "salle"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Compte rendu téléchargé");
  };

  const forceGenerateReport = () => {
    const report = generateNotionStyleReport();
    setNotionStyleReport(report);
    toast.success("Compte rendu généré");
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

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-room", {
        body: { roomId },
      });

      if (error) throw error;

      setAiAnalysisData(data);
      setShowAiResults(true);
      toast.success("Analyse IA terminée");
    } catch (error: any) {
      console.error("Error analyzing room:", error);
      toast.error(error.message || "Erreur lors de l'analyse IA");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAISelections = useMutation({
    mutationFn: async (selections: any) => {
      const { selectedLinks, selectedAudioLinks, applyAudioConfig, applyConnectivity } = selections;

      // Create selected video/network links
      for (const linkId of selectedLinks) {
        const link = aiAnalysisData.links.find((l: any) => l.id === linkId);
        if (link) {
          const distance = 10; // Default distance, could be calculated
          await supabase.from("cables").insert({
            room_id: roomId,
            point_a: link.from,
            point_b: link.to,
            signal_type: link.signal_type,
            distance_m: distance,
            distance_with_margin_m: distance * 1.2,
            cable_recommendation: link.transport,
          });
        }
      }

      // Create selected audio links
      for (const linkId of selectedAudioLinks) {
        const link = aiAnalysisData.audio_links.find((l: any) => l.id === linkId);
        if (link) {
          const distance = 10; // Default distance
          await supabase.from("cables").insert({
            room_id: roomId,
            point_a: link.from,
            point_b: link.to,
            signal_type: link.signal_type,
            distance_m: distance,
            distance_with_margin_m: distance * 1.2,
            cable_recommendation: link.transport,
          });
        }
      }

      // Save AI config and results to room
      const updateData: any = {
        warnings_ia: aiAnalysisData.warnings,
        critical_errors_ia: aiAnalysisData.critical_errors,
        debug_ia: aiAnalysisData.debug,
        resume_technique_ia: aiAnalysisData.summary_text,
      };

      if (applyAudioConfig) {
        updateData.audio_config_ia = aiAnalysisData.audio_config;
      }

      await supabase.from("rooms").update(updateData).eq("id", roomId);

      // Apply connectivity if selected
      if (applyConnectivity && aiAnalysisData.user_connectivity?.table) {
        const conn = aiAnalysisData.user_connectivity.table;
        await supabase.from("connectivity_zones").upsert({
          room_id: roomId,
          zone_name: "Table (IA)",
          hdmi_count: conn.hdmi,
          usbc_count: conn.usbc,
          rj45_count: conn.rj45,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
      queryClient.invalidateQueries({ queryKey: ["connectivity_zones", roomId] });
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setShowAiResults(false);
      toast.success("Recommandations IA appliquées");
    },
    onError: (error: any) => {
      console.error("Error applying AI selections:", error);
      toast.error("Erreur lors de l'application des recommandations");
    },
  });

  // Générer automatiquement le compte rendu structuré au chargement
  useEffect(() => {
    if (room && sources && displays && roomUsage && roomEnvironment && roomVisio && roomSonorization && connectivityZones && cables) {
      const report = generateNotionStyleReport();
      setNotionStyleReport(report);
    }
  }, [room, sources, displays, roomUsage, roomEnvironment, roomVisio, roomSonorization, connectivityZones, cables, generateNotionStyleReport]);

  return (
    <>
      {showAiResults && aiAnalysisData && (
        <AIAnalysisResults
          data={aiAnalysisData}
          onApply={(selections) => applyAISelections.mutate(selections)}
          onClose={() => setShowAiResults(false)}
        />
      )}

      <div className="space-y-4">
        {/* Compte rendu structuré style Notion */}
        <Card className="glass neon-border-yellow p-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="neon-yellow">📋 Compte rendu structuré</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={forceGenerateReport}
                variant="default"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Générer
              </Button>
              <Button
                onClick={downloadNotionStyleReport}
                variant="secondary"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger .md
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap bg-background/30 p-4 rounded-lg text-sm border border-border overflow-auto max-h-96">
{notionStyleReport}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card className="glass neon-border-yellow p-6">
          <CardHeader>
            <CardTitle className="neon-yellow">Analyse IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Utilisez l'intelligence artificielle pour analyser automatiquement
              la salle et obtenir des recommandations complètes sur les liaisons,
              la sonorisation, et la connectique.
            </p>
            <Button
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              className="w-full neon-border-blue"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyse en cours..." : "Analyser avec l'IA"}
            </Button>
          </CardContent>
        </Card>

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

      {/* AI Analysis Results Summary */}
      {room?.resume_technique_ia && (
        <Card className="glass neon-border-blue p-6">
          <CardHeader>
            <CardTitle className="neon-blue">Analyse IA complète</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Critical Errors */}
            {room.critical_errors_ia && room.critical_errors_ia.length > 0 && (
              <div className="border-destructive bg-destructive/10 p-4 rounded-lg">
                <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  Erreurs critiques détectées par l'IA
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {room.critical_errors_ia.map((error: string, i: number) => (
                    <li key={i} className="text-destructive">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {room.warnings_ia && room.warnings_ia.length > 0 && (
              <div className="border-yellow-500/50 bg-yellow-500/10 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-500 mb-2">Avertissements</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {room.warnings_ia.map((warning: string, i: number) => (
                    <li key={i} className="text-yellow-500">{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Audio Config */}
            {room.audio_config_ia && (
              <div className="bg-background/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Configuration audio recommandée par l'IA</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {(room.audio_config_ia as any).type_sonorisation}</p>
                  {(room.audio_config_ia as any).ambiance?.active && (
                    <p><strong>Ambiance:</strong> {(room.audio_config_ia as any).ambiance.description}</p>
                  )}
                  {(room.audio_config_ia as any).puissance?.active && (
                    <p><strong>Puissance:</strong> {(room.audio_config_ia as any).puissance.niveau} - {(room.audio_config_ia as any).puissance.description}</p>
                  )}
                  {(room.audio_config_ia as any).diffusion?.homogene && (
                    <p><strong>Diffusion:</strong> {(room.audio_config_ia as any).diffusion.mode.join(", ")} ({(room.audio_config_ia as any).diffusion.approx_nb_enceintes} enceintes approx.)</p>
                  )}
                  <p><strong>Traitement:</strong> DSP {(room.audio_config_ia as any).traitement?.dsp_recommande ? "recommandé" : "non nécessaire"}, Dante {(room.audio_config_ia as any).traitement?.dante_recommande ? "recommandé" : "non nécessaire"}</p>
                </div>
              </div>
            )}

            {/* AI Summary Text */}
            <div className="space-y-2">
              <Label>Résumé technique IA</Label>
              <textarea
                className="w-full h-64 p-4 bg-background/50 border border-border rounded-lg text-sm font-mono"
                value={room.resume_technique_ia}
                readOnly
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(room.resume_technique_ia);
                  toast.success("Résumé IA copié");
                }}
                variant="secondary"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le résumé IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
};
