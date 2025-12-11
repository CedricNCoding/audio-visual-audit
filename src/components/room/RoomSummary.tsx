import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Copy, Sparkles, Save, FileText, FileType } from "lucide-react";
import { toast } from "sonner";
import { AIAnalysisResults } from "@/components/ai/AIAnalysisResults";
import { RoomPlanViewer } from "./RoomPlanViewer";
import jsPDF from "jspdf";

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
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [numeroDevis, setNumeroDevis] = useState("");
  const [numeroAffaire, setNumeroAffaire] = useState("");

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

  const getPhotoUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from("room-photos")
      .getPublicUrl(`${roomId}/${fileName}`);
    return data.publicUrl;
  };

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

  const { data: elementsSalle } = useQuery({
    queryKey: ["elements_salle", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("elements_salle")
        .select("*")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    },
  });

  // Initialiser les numéros depuis les données de la salle
  useEffect(() => {
    if (room) {
      setNumeroDevis((room as any).numero_devis || "");
      setNumeroAffaire((room as any).numero_affaire || "");
    }
  }, [room]);

  // Mutation pour sauvegarder les numéros
  const saveNumeros = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("rooms")
        .update({ 
          numero_devis: numeroDevis || null,
          numero_affaire: numeroAffaire || null
        })
        .eq("id", roomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      toast.success("Numéros sauvegardés");
    },
  });

  const generateScenarios = async () => {
    setIsGeneratingScenarios(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-scenarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ roomId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération des scénarios");
      }

      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      toast.success("Scénarios générés avec succès");
    } catch (error) {
      console.error("Error generating scenarios:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de la génération des scénarios");
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

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
    if (room?.projects?.site_address) text += `• Adresse du site : ${room.projects.site_address}\n`;
    if (room?.projects?.building_name) text += `• Bâtiment : ${room.projects.building_name}\n`;
    text += `• Projet : ${room?.name || "N/A"}\n`;
    text += `• Service décideur : ${room?.projects?.decision_service || "N/A"} – Contact : ${room?.projects?.decision_contact || "N/A"}\n`;
    text += `• Date de décision prévue : ${room?.projects?.decision_date || "N/A"}\n`;
    text += `• Parking utilitaire (2m) : ${room?.projects?.parking_utilitaire ? "Oui" : "Non"}\n`;
    if (room?.projects?.comments) text += `• Commentaires projet : ${room.projects.comments}\n`;
    text += `\n`;

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
      text += `• Formation demandée : ${roomUsage.formation_demandee ? "Oui" : "Non"}\n`;
      text += `• Dépose matériel autorisée : ${roomUsage.depose_materiel ? "Oui" : "Non"}\n`;
      if (roomUsage.depose_materiel) {
        text += `• Rapatriement matériel nécessaire : ${roomUsage.rapatriement_materiel ? "Oui" : "Non"}\n`;
      }
      // Automatisation
      const automations = [];
      if (roomUsage.automation_lighting) automations.push("Éclairage");
      if (roomUsage.automation_acoustic) automations.push("Acoustique");
      if (roomUsage.automation_booking) automations.push("Réservation");
      if (automations.length > 0) {
        text += `• Automatisation souhaitée : ${automations.join(", ")}\n`;
      }
    }
    text += `\n`;

    // Section 3 – Environnement
    if (roomEnvironment) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 3 – ENVIRONNEMENT                           │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      text += `• Dimensions : ${roomEnvironment.length_m || "?"}m x ${roomEnvironment.width_m || "?"}m x ${roomEnvironment.height_m || "?"}m\n`;
      // Matériaux des murs individuels
      if (roomEnvironment.mur_a_materiau) text += `• Mur A (haut) : ${roomEnvironment.mur_a_materiau}\n`;
      if (roomEnvironment.mur_b_materiau) text += `• Mur B (droite) : ${roomEnvironment.mur_b_materiau}\n`;
      if (roomEnvironment.mur_c_materiau) text += `• Mur C (bas) : ${roomEnvironment.mur_c_materiau}\n`;
      if (roomEnvironment.mur_d_materiau) text += `• Mur D (gauche) : ${roomEnvironment.mur_d_materiau}\n`;
      if (roomEnvironment.mur_principal) text += `• Mur principal (diffuseur) : Mur ${roomEnvironment.mur_principal}\n`;
      text += `• Sol : ${roomEnvironment.floor_material || "N/A"} – Plafond : ${roomEnvironment.ceiling_material || "N/A"}\n`;
      text += `• Plancher technique : ${roomEnvironment.has_raised_floor ? "Oui" : "Non"}\n`;
      text += `• Faux plafond technique : ${roomEnvironment.has_false_ceiling ? "Oui" : "Non"}\n`;
      text += `• Luminosité : ${roomEnvironment.brightness_level || "N/A"}\n`;
      text += `• Problèmes acoustiques : ${roomEnvironment.has_acoustic_issue ? "Oui" : "Non"}${roomEnvironment.acoustic_comment ? ` - ${roomEnvironment.acoustic_comment}` : ""}\n`;
      text += `• Présence RJ45 : ${roomEnvironment.has_rj45 ? `Oui (${roomEnvironment.rj45_count || 0} prises)` : "Non"}\n`;
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

    // Section 10 – Implantation – Plan de salle
    if (elementsSalle && elementsSalle.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 10 – IMPLANTATION – PLAN DE SALLE           │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      
      const elementsByType = elementsSalle.reduce((acc: any, el: any) => {
        if (!acc[el.type_element]) acc[el.type_element] = [];
        acc[el.type_element].push(el);
        return acc;
      }, {});

      Object.entries(elementsByType).forEach(([type, elements]: [string, any]) => {
        text += `• ${type}s : ${elements.length}\n`;
        elements.forEach((el: any, idx: number) => {
          const label = el.label || `${type} #${idx + 1}`;
          text += `  - ${label} à position (~${Math.round(el.position_x)}%, ~${Math.round(el.position_y)}%)`;
          if (el.commentaire) text += ` – ${el.commentaire}`;
          text += `\n`;
        });
      });
      text += `\n`;
    }

    // Section 11 – Synthèse
    text += `┌─────────────────────────────────────────────────────┐\n`;
    text += `│ Section 11 – SYNTHÈSE                               │\n`;
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
    
    // Numéros de devis et affaire
    if (room.numero_devis || room.numero_affaire) {
      if (room.numero_devis) md += `**N° Devis:** ${room.numero_devis}  \n`;
      if (room.numero_affaire) md += `**N° Affaire:** ${room.numero_affaire}  \n`;
      md += `\n`;
    }
    
    // Sous-titre projet
    if (room.projects) {
      md += `**Projet:** ${room.projects.client_name}`;
      if (room.projects.site_name) md += ` – Site: ${room.projects.site_name}`;
      md += `\n\n`;
      
      // Détails du projet
      if (room.projects.site_address) md += `- **Adresse du site:** ${room.projects.site_address}\n`;
      if (room.projects.building_name) md += `- **Bâtiment:** ${room.projects.building_name}\n`;
      if (room.projects.decision_service) md += `- **Service décideur:** ${room.projects.decision_service}\n`;
      if (room.projects.decision_contact) md += `- **Contact décideur:** ${room.projects.decision_contact}\n`;
      if (room.projects.decision_date) md += `- **Date de décision prévue:** ${room.projects.decision_date}\n`;
      md += `- **Parking utilitaire (2m):** ${room.projects.parking_utilitaire ? "Oui" : "Non"}\n`;
      if (room.projects.comments) md += `- **Commentaires:** ${room.projects.comments}\n`;
      md += `\n`;
    }

    // Usage & Contexte
    md += `## 🎯 Usage & Contexte\n\n`;
    if (roomUsage) {
      if (roomUsage.nombre_personnes) md += `- **Capacité:** ${roomUsage.nombre_personnes} personnes\n`;
      if (roomUsage.main_usage) md += `- **Usage principal:** ${roomUsage.main_usage}\n`;
      if (roomUsage.platform_type) md += `- **Plateforme:** ${roomUsage.platform_type}\n`;
      md += `- **Réservation salle:** ${roomUsage.reservation_salle ? "Oui" : "Non"}\n`;
      md += `- **Formation demandée:** ${roomUsage.formation_demandee ? "Oui" : "Non"}\n`;
      md += `- **Dépose matériel:** ${roomUsage.depose_materiel ? "Oui" : "Non"}\n`;
      if (roomUsage.depose_materiel) {
        md += `- **Rapatriement matériel:** ${roomUsage.rapatriement_materiel ? "Oui" : "Non"}\n`;
      }
      // Automatisation
      const automationsList = [];
      if (roomUsage.automation_lighting) automationsList.push("Éclairage");
      if (roomUsage.automation_acoustic) automationsList.push("Acoustique");
      if (roomUsage.automation_booking) automationsList.push("Réservation");
      if (automationsList.length > 0) {
        md += `- **Automatisation:** ${automationsList.join(", ")}\n`;
      }
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
      
      // Matériaux des murs individuels
      if (roomEnvironment.mur_a_materiau) md += `- **Mur A (haut):** ${roomEnvironment.mur_a_materiau}\n`;
      if (roomEnvironment.mur_b_materiau) md += `- **Mur B (droite):** ${roomEnvironment.mur_b_materiau}\n`;
      if (roomEnvironment.mur_c_materiau) md += `- **Mur C (bas):** ${roomEnvironment.mur_c_materiau}\n`;
      if (roomEnvironment.mur_d_materiau) md += `- **Mur D (gauche):** ${roomEnvironment.mur_d_materiau}\n`;
      if (roomEnvironment.mur_principal) md += `- **Mur principal (diffuseur):** Mur ${roomEnvironment.mur_principal}\n`;
      if (roomEnvironment.floor_material) md += `- **Sol:** ${roomEnvironment.floor_material}\n`;
      if (roomEnvironment.ceiling_material) md += `- **Plafond:** ${roomEnvironment.ceiling_material}\n`;
      md += `- **Plancher technique:** ${roomEnvironment.has_raised_floor ? "Oui" : "Non"}\n`;
      md += `- **Faux plafond technique:** ${roomEnvironment.has_false_ceiling ? "Oui" : "Non"}\n`;
      if (roomEnvironment.brightness_level) md += `- **Luminosité:** ${roomEnvironment.brightness_level}\n`;
      md += `- **Problèmes acoustiques:** ${roomEnvironment.has_acoustic_issue ? "Oui" : "Non"}`;
      if (roomEnvironment.has_acoustic_issue && roomEnvironment.acoustic_comment) {
        md += ` - ${roomEnvironment.acoustic_comment}`;
      }
      md += `\n`;
      md += `- **Présence RJ45:** ${roomEnvironment.has_rj45 ? `Oui (${roomEnvironment.rj45_count || 0} prises)` : "Non"}\n`;
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


    // Implantation des éléments dans la salle
    if (elementsSalle && elementsSalle.length > 0) {
      md += `## 🗺️ Implantation des éléments\n\n`;
      
      const elementsByType = elementsSalle.reduce((acc: Record<string, any[]>, el: any) => {
        if (!acc[el.type_element]) acc[el.type_element] = [];
        acc[el.type_element].push(el);
        return acc;
      }, {});

      Object.entries(elementsByType).forEach(([type, elements]) => {
        md += `### ${type}s (${elements.length})\n\n`;
        elements.forEach((el: any, idx: number) => {
          const label = el.label || `${type} #${idx + 1}`;
          md += `- **${label}** – Position (~${Math.round(el.position_x)}%, ~${Math.round(el.position_y)}%)\n`;
          if (el.commentaire) md += `  - *${el.commentaire}*\n`;
        });
        md += `\n`;
      });
    }

    // Photos de la salle - liens cliquables
    if (photos && photos.length > 0) {
      md += `## 🖼️ Photos de la salle\n\n`;
      photos.forEach((photo, index) => {
        const photoUrl = getPhotoUrl(photo.name);
        const photoName = photo.name.split('_').slice(1).join('_') || `Photo ${index + 1}`;
        md += `- [📷 ${photoName}](${photoUrl})\n`;
      });
      md += `\n`;
    }


    // Scénarios d'usage
    if (room.scenarios_usage) {
      md += `## 📋 Scénarios d'usage proposés\n\n`;
      md += room.scenarios_usage;
      md += `\n\n`;
    }

    // Analyse IA
    if (room.resume_technique_ia || room.warnings_ia || room.critical_errors_ia) {
      md += `## 🤖 Analyse IA\n\n`;
      
      if (room.critical_errors_ia && room.critical_errors_ia.length > 0) {
        md += `### ⚠️ Erreurs critiques\n\n`;
        room.critical_errors_ia.forEach((error: any) => {
          const errorText = typeof error === 'string' ? error : error.message || JSON.stringify(error);
          md += `- ❌ ${errorText}\n`;
        });
        md += `\n`;
      }
      
      if (room.warnings_ia && room.warnings_ia.length > 0) {
        md += `### ⚡ Avertissements\n\n`;
        room.warnings_ia.forEach((warning: any) => {
          const warningText = typeof warning === 'string' ? warning : warning.message || JSON.stringify(warning);
          md += `- ⚠️ ${warningText}\n`;
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
  }, [room, sources, displays, roomUsage, roomEnvironment, roomVisio, roomSonorization, connectivityZones, cables, photos]);

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

  // Export RTF
  const downloadRTFFile = () => {
    if (!notionStyleReport) {
      toast.error("Générez d'abord le compte rendu");
      return;
    }
    
    // Convert markdown to RTF
    const rtfContent = convertMarkdownToRTF(notionStyleReport);
    const blob = new Blob([rtfContent], { type: "application/rtf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Compte-rendu-${room?.name || "salle"}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Fichier RTF téléchargé");
  };

  const convertMarkdownToRTF = (markdown: string): string => {
    let rtf = "{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\fmodern\\fcharset0 Courier New;}}\n";
    rtf += "{\\colortbl ;\\red0\\green0\\blue0;\\red0\\green100\\blue200;\\red200\\green50\\blue0;\\red0\\green150\\blue0;}\n";
    rtf += "\\viewkind4\\uc1\\pard\\sa200\\sl276\\slmult1\\f0\\fs22\n";
    
    const lines = markdown.split("\n");
    
    for (const line of lines) {
      let processedLine = line;
      
      // Headers
      if (line.startsWith("# ")) {
        rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\fs36 ${escapeRTF(line.substring(2))}\\b0\\fs22\\par\n`;
        continue;
      }
      if (line.startsWith("## ")) {
        rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\fs28 ${escapeRTF(line.substring(3))}\\b0\\fs22\\par\n`;
        continue;
      }
      if (line.startsWith("### ")) {
        rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\fs24 ${escapeRTF(line.substring(4))}\\b0\\fs22\\par\n`;
        continue;
      }
      
      // Bold **text**
      processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, "\\b $1\\b0 ");
      
      // Links [text](url) -> text (url)
      processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 (\\cf2 $2\\cf1 )");
      
      // List items
      if (line.startsWith("- ")) {
        rtf += `\\pard\\fi-360\\li720\\sa200\\sl276\\slmult1 \\bullet  ${escapeRTF(processedLine.substring(2))}\\par\n`;
        continue;
      }
      
      // Normal paragraph
      if (processedLine.trim()) {
        rtf += `\\pard\\sa200\\sl276\\slmult1 ${escapeRTF(processedLine)}\\par\n`;
      } else {
        rtf += "\\par\n";
      }
    }
    
    rtf += "}";
    return rtf;
  };

  const escapeRTF = (text: string): string => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/[àâä]/g, "\\'e0")
      .replace(/[éèêë]/g, "\\'e9")
      .replace(/[îï]/g, "\\'ee")
      .replace(/[ôö]/g, "\\'f4")
      .replace(/[ùûü]/g, "\\'f9")
      .replace(/ç/g, "\\'e7")
      .replace(/[ÀÂÄÆ]/g, "\\'c0")
      .replace(/[ÉÈÊË]/g, "\\'c9")
      .replace(/[ÎÏ]/g, "\\'ce")
      .replace(/[ÔÖ]/g, "\\'d4")
      .replace(/[ÙÛÜ]/g, "\\'d9")
      .replace(/Ç/g, "\\'c7")
      .replace(/œ/g, "\\'9c")
      .replace(/Œ/g, "\\'8c");
  };

  // Export PDF with room plans
  const downloadPDFFile = () => {
    if (!notionStyleReport || !room) {
      toast.error("Générez d'abord le compte rendu");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Helper to add new page if needed
    const checkNewPage = (height: number) => {
      if (yPos + height > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Draw room schematic (wall materials)
    const drawRoomSchematic = () => {
      if (!roomEnvironment?.length_m || !roomEnvironment?.width_m) return;

      checkNewPage(100);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Schema simplifie de la salle (vue de dessus)", margin, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const roomLength = Number(roomEnvironment.length_m);
      const roomWidth = Number(roomEnvironment.width_m);
      
      // Calculate proportional plan size (width = horizontal, length = vertical)
      // Max dimensions for the plan in the PDF
      const maxPlanWidth = 100;
      const maxPlanHeight = 60;
      
      // Calculate scale to fit within max dimensions while maintaining aspect ratio
      const scaleX = maxPlanWidth / roomWidth;
      const scaleY = maxPlanHeight / roomLength;
      const scale = Math.min(scaleX, scaleY);
      
      const planWidth = roomWidth * scale;  // Horizontal dimension
      const planHeight = roomLength * scale; // Vertical dimension
      const planX = margin + (maxWidth - planWidth) / 2;
      const planY = yPos;

      // Draw room rectangle
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.rect(planX, planY, planWidth, planHeight);

      // Draw walls with labels
      doc.setFontSize(8);
      
      // Wall A (top) - width dimension
      const wallALabel = roomEnvironment.mur_a_materiau ? `A - ${roomEnvironment.mur_a_materiau}` : "A";
      doc.text(wallALabel + (roomEnvironment.mur_principal === "A" ? " (principal)" : ""), planX + planWidth / 2, planY - 3, { align: "center" });
      if (roomEnvironment.mur_principal === "A") {
        doc.setLineWidth(1.5);
        doc.line(planX, planY, planX + planWidth, planY);
        doc.setLineWidth(0.5);
      }

      // Wall B (right) - length dimension
      const wallBLabel = roomEnvironment.mur_b_materiau ? `B - ${roomEnvironment.mur_b_materiau}` : "B";
      doc.text(wallBLabel + (roomEnvironment.mur_principal === "B" ? " (principal)" : ""), planX + planWidth + 3, planY + planHeight / 2, { angle: 90 });
      if (roomEnvironment.mur_principal === "B") {
        doc.setLineWidth(1.5);
        doc.line(planX + planWidth, planY, planX + planWidth, planY + planHeight);
        doc.setLineWidth(0.5);
      }

      // Wall C (bottom) - width dimension
      const wallCLabel = roomEnvironment.mur_c_materiau ? `C - ${roomEnvironment.mur_c_materiau}` : "C";
      doc.text(wallCLabel + (roomEnvironment.mur_principal === "C" ? " (principal)" : ""), planX + planWidth / 2, planY + planHeight + 8, { align: "center" });
      if (roomEnvironment.mur_principal === "C") {
        doc.setLineWidth(1.5);
        doc.line(planX, planY + planHeight, planX + planWidth, planY + planHeight);
        doc.setLineWidth(0.5);
      }

      // Wall D (left) - length dimension
      const wallDLabel = roomEnvironment.mur_d_materiau ? `D - ${roomEnvironment.mur_d_materiau}` : "D";
      doc.text(wallDLabel + (roomEnvironment.mur_principal === "D" ? " (principal)" : ""), planX - 3, planY + planHeight / 2, { angle: -90 });
      if (roomEnvironment.mur_principal === "D") {
        doc.setLineWidth(1.5);
        doc.line(planX, planY, planX, planY + planHeight);
        doc.setLineWidth(0.5);
      }

      // Dimensions labels
      doc.setFontSize(9);
      doc.text(`${roomWidth}m`, planX + planWidth / 2, planY + planHeight + 15, { align: "center" });
      doc.text(`${roomLength}m`, planX - 8, planY + planHeight / 2, { angle: -90 });

      yPos = planY + planHeight + 25;
    };

    // Draw room plan with elements
    const drawRoomPlanWithElements = () => {
      if (!roomEnvironment?.length_m || !roomEnvironment?.width_m || !elementsSalle || elementsSalle.length === 0) return;

      checkNewPage(100);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Plan d'implantation des elements", margin, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const roomLength = Number(roomEnvironment.length_m);
      const roomWidth = Number(roomEnvironment.width_m);
      
      // Calculate proportional plan size (width = horizontal, length = vertical)
      const maxPlanWidth = 100;
      const maxPlanHeight = 60;
      const scaleX = maxPlanWidth / roomWidth;
      const scaleY = maxPlanHeight / roomLength;
      const scale = Math.min(scaleX, scaleY);
      
      const planWidth = roomWidth * scale;
      const planHeight = roomLength * scale;
      const planX = margin + (maxWidth - planWidth) / 2;
      const planY = yPos;

      // Draw room rectangle
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.rect(planX, planY, planWidth, planHeight);

      // Element type symbols
      const elementSymbols: Record<string, string> = {
        "Écran": "E",
        "Vidéoprojecteur": "VP",
        "Écran de projection": "EP",
        "Enceinte": "S",
        "Régie": "R",
        "Connectique": "C",
        "Caméra": "Ca",
      };

      // Draw elements
      doc.setFontSize(7);
      elementsSalle.forEach((el: any) => {
        const elX = planX + (el.position_x / 100) * planWidth;
        const elY = planY + (el.position_y / 100) * planHeight;
        
        // Draw circle
        doc.setFillColor(50, 50, 50);
        doc.circle(elX, elY, 4, "F");
        
        // Draw symbol
        doc.setTextColor(255, 255, 255);
        const symbol = elementSymbols[el.type_element] || "?";
        doc.text(symbol, elX, elY + 1.5, { align: "center" });
        doc.setTextColor(0, 0, 0);
      });

      // Legend
      yPos = planY + planHeight + 10;
      doc.setFontSize(8);
      doc.text("Legende:", margin, yPos);
      yPos += 5;

      const elementCounts = elementsSalle.reduce((acc: Record<string, number>, el: any) => {
        acc[el.type_element] = (acc[el.type_element] || 0) + 1;
        return acc;
      }, {});

      Object.entries(elementCounts).forEach(([type, count]) => {
        const symbol = elementSymbols[type] || "?";
        doc.text(`${symbol} = ${type} (${count})`, margin + 5, yPos);
        yPos += 4;
      });

      yPos += 10;
    };

    const lines = notionStyleReport.split("\n");
    
    for (const line of lines) {
      // Headers
      if (line.startsWith("# ")) {
        checkNewPage(15);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        const text = line.substring(2).replace(/[📋🎯📐🔊📹🖥️🔌🔗🗺️🖼️📋🤖⚠️⚡🎵]/g, "");
        doc.text(text.trim(), margin, yPos);
        yPos += 12;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        continue;
      }
      
      if (line.startsWith("## ")) {
        // Insert room plans after Environment section
        if (line.includes("Environnement")) {
          checkNewPage(12);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          const text = line.substring(3).replace(/[📋🎯📐🔊📹🖥️🔌🔗🗺️🖼️📋🤖⚠️⚡🎵]/g, "");
          doc.text(text.trim(), margin, yPos);
          yPos += 10;
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          continue;
        }
        
        // Insert plans before Sources section
        if (line.includes("Sources")) {
          drawRoomSchematic();
          drawRoomPlanWithElements();
        }
        
        checkNewPage(12);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const text = line.substring(3).replace(/[📋🎯📐🔊📹🖥️🔌🔗🗺️🖼️📋🤖⚠️⚡🎵]/g, "");
        doc.text(text.trim(), margin, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        continue;
      }
      
      if (line.startsWith("### ")) {
        checkNewPage(10);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const text = line.substring(4).replace(/[📋🎯📐🔊📹🖥️🔌🔗🗺️🖼️📋🤖⚠️⚡🎵]/g, "");
        doc.text(text.trim(), margin, yPos);
        yPos += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        continue;
      }

      // Clean text from markdown
      let cleanLine = line
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
        .replace(/^- /, "• ");

      if (cleanLine.trim()) {
        const splitLines = doc.splitTextToSize(cleanLine, maxWidth);
        checkNewPage(splitLines.length * 5 + 2);
        doc.text(splitLines, margin, yPos);
        yPos += splitLines.length * 5 + 2;
      } else {
        yPos += 3;
      }
    }

    doc.save(`Compte-rendu-${room.name || "salle"}.pdf`);
    toast.success("Fichier PDF telecharge");
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

      let cablesCreated = 0;

      // Create selected video/network links
      if (selectedLinks && selectedLinks.length > 0 && aiAnalysisData?.links) {
        for (const linkId of selectedLinks) {
          const link = aiAnalysisData.links.find((l: any) => l.id === linkId);
          if (link) {
            const distance = 10; // Default distance, could be calculated
            const { error } = await supabase.from("cables").insert({
              room_id: roomId,
              point_a: link.from,
              point_b: link.to,
              signal_type: link.signal_type,
              transport: link.transport || "HDMI",
              distance_m: distance,
              distance_with_margin_m: distance * 1.2,
              commentaire: link.comment,
            });
            if (error) {
              console.error("Error creating cable:", error);
              throw error;
            }
            cablesCreated++;
          }
        }
      }

      // Create selected audio links
      if (selectedAudioLinks && selectedAudioLinks.length > 0 && aiAnalysisData?.audio_links) {
        for (const linkId of selectedAudioLinks) {
          const link = aiAnalysisData.audio_links.find((l: any) => l.id === linkId);
          if (link) {
            const distance = 10; // Default distance
            const { error } = await supabase.from("cables").insert({
              room_id: roomId,
              point_a: link.from,
              point_b: link.to,
              signal_type: link.signal_type,
              transport: link.transport || "XLR",
              distance_m: distance,
              distance_with_margin_m: distance * 1.2,
              commentaire: link.comment,
            });
            if (error) {
              console.error("Error creating audio cable:", error);
              throw error;
            }
            cablesCreated++;
          }
        }
      }

      // Save AI config and results to room
      const updateData: any = {
        warnings_ia: aiAnalysisData?.warnings || [],
        critical_errors_ia: aiAnalysisData?.critical_errors || [],
        debug_ia: aiAnalysisData?.debug || [],
        resume_technique_ia: aiAnalysisData?.summary_text || "",
      };

      if (applyAudioConfig && aiAnalysisData?.audio_config) {
        updateData.audio_config_ia = aiAnalysisData.audio_config;
      }

      const { error: roomError } = await supabase.from("rooms").update(updateData).eq("id", roomId);
      if (roomError) {
        console.error("Error updating room:", roomError);
        throw roomError;
      }

      // Apply connectivity if selected
      if (applyConnectivity && aiAnalysisData?.user_connectivity?.table) {
        const conn = aiAnalysisData.user_connectivity.table;
        const { error: connError } = await supabase.from("connectivity_zones").upsert({
          room_id: roomId,
          zone_name: "Table (IA)",
          hdmi_count: conn.hdmi || 0,
          usbc_count: conn.usbc || 0,
          rj45_count: conn.rj45 || 0,
        });
        if (connError) {
          console.error("Error updating connectivity:", connError);
          throw connError;
        }
      }

      return { cablesCreated };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cables", roomId] });
      queryClient.invalidateQueries({ queryKey: ["connectivity_zones", roomId] });
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      setShowAiResults(false);
      toast.success(`Recommandations IA appliquées (${data.cablesCreated} liaisons créées)`);
    },
    onError: (error: any) => {
      console.error("Error applying AI selections:", error);
      toast.error("Erreur lors de l'application des recommandations: " + (error.message || "Erreur inconnue"));
    },
  });

  // Générer automatiquement le compte rendu structuré au chargement
  useEffect(() => {
    if (room && sources && displays && roomUsage && roomEnvironment && roomVisio && roomSonorization && connectivityZones && cables && photos !== undefined) {
      const report = generateNotionStyleReport();
      setNotionStyleReport(report);
    }
  }, [room, sources, displays, roomUsage, roomEnvironment, roomVisio, roomSonorization, connectivityZones, cables, photos, generateNotionStyleReport]);

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
        {/* Références commerciales */}
        <Card className="glass neon-border-cyan p-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg neon-blue">📝 Références commerciales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="numero_devis" className="text-sm text-muted-foreground">N° Devis</Label>
                <Input
                  id="numero_devis"
                  value={numeroDevis}
                  onChange={(e) => setNumeroDevis(e.target.value)}
                  placeholder="Ex: DEV-2024-0123"
                  className="bg-glass-light border-glass-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_affaire" className="text-sm text-muted-foreground">N° Affaire</Label>
                <Input
                  id="numero_affaire"
                  value={numeroAffaire}
                  onChange={(e) => setNumeroAffaire(e.target.value)}
                  placeholder="Ex: AFF-2024-0456"
                  className="bg-glass-light border-glass-border"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => saveNumeros.mutate()}
                  disabled={saveNumeros.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compte rendu structuré style Notion */}
        <Card className="glass neon-border-yellow p-6">
          <CardHeader className="flex flex-col gap-4">
            <CardTitle className="neon-yellow">📋 Compte rendu structuré</CardTitle>
            <div className="flex flex-wrap gap-2">
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
                .md
              </Button>
              <Button
                onClick={downloadRTFFile}
                variant="secondary"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                .rtf
              </Button>
              <Button
                onClick={downloadPDFFile}
                variant="secondary"
                size="sm"
              >
                <FileType className="h-4 w-4 mr-2" />
                .pdf
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap bg-background/30 p-4 rounded-lg text-sm border border-border overflow-auto max-h-96">
{notionStyleReport}
              </pre>
            </div>

            {/* Plan d'implantation avec éléments placés */}
            <RoomPlanViewer
              roomId={roomId}
              roomLength={roomEnvironment?.length_m}
              roomWidth={roomEnvironment?.width_m}
            />

            {/* Mini-plan de la salle */}
            {roomEnvironment && roomEnvironment.length_m && roomEnvironment.width_m && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold neon-blue flex items-center gap-2">
                  📐 Plan de la salle (simplifié)
                </h3>
                <div className="glass neon-border-blue p-4 rounded-lg">
                  <div className="flex justify-center mb-4">
                    {(() => {
                      const maxWidth = 300;
                      const ratio = roomEnvironment.width_m / roomEnvironment.length_m;
                      const svgWidth = Math.min(maxWidth, ratio > 1 ? maxWidth : maxWidth * ratio);
                      const svgHeight = ratio > 1 ? svgWidth / ratio : svgWidth;
                      
                      return (
                        <svg width={svgWidth + 100} height={svgHeight + 100} className="border border-border/20 rounded-lg bg-background/20">
                          {/* Mur A (haut) */}
                          <line
                            x1={50}
                            y1={50}
                            x2={50 + svgWidth}
                            y2={50}
                            className={`stroke-[2px] fill-none ${roomEnvironment.mur_principal === 'A' ? 'stroke-primary neon-border-blue stroke-[4px]' : 'stroke-border'}`}
                          />
                          <text x={50 + svgWidth / 2} y={40} textAnchor="middle" className="fill-foreground text-xs">
                            {roomEnvironment.mur_a_materiau ? `A - ${roomEnvironment.mur_a_materiau}` : "A"}
                            {roomEnvironment.mur_principal === "A" && " 🖥️"}
                          </text>

                          {/* Mur B (droite) */}
                          <line
                            x1={50 + svgWidth}
                            y1={50}
                            x2={50 + svgWidth}
                            y2={50 + svgHeight}
                            className={`stroke-[2px] fill-none ${roomEnvironment.mur_principal === 'B' ? 'stroke-primary neon-border-blue stroke-[4px]' : 'stroke-border'}`}
                          />
                          <text x={60 + svgWidth} y={50 + svgHeight / 2} textAnchor="start" className="fill-foreground text-xs">
                            {roomEnvironment.mur_b_materiau ? `B - ${roomEnvironment.mur_b_materiau}` : "B"}
                            {roomEnvironment.mur_principal === "B" && " 🖥️"}
                          </text>

                          {/* Mur C (bas) */}
                          <line
                            x1={50}
                            y1={50 + svgHeight}
                            x2={50 + svgWidth}
                            y2={50 + svgHeight}
                            className={`stroke-[2px] fill-none ${roomEnvironment.mur_principal === 'C' ? 'stroke-primary neon-border-blue stroke-[4px]' : 'stroke-border'}`}
                          />
                          <text x={50 + svgWidth / 2} y={65 + svgHeight} textAnchor="middle" className="fill-foreground text-xs">
                            {roomEnvironment.mur_c_materiau ? `C - ${roomEnvironment.mur_c_materiau}` : "C"}
                            {roomEnvironment.mur_principal === "C" && " 🖥️"}
                          </text>

                          {/* Mur D (gauche) */}
                          <line
                            x1={50}
                            y1={50}
                            x2={50}
                            y2={50 + svgHeight}
                            className={`stroke-[2px] fill-none ${roomEnvironment.mur_principal === 'D' ? 'stroke-primary neon-border-blue stroke-[4px]' : 'stroke-border'}`}
                          />
                          <text x={40} y={50 + svgHeight / 2} textAnchor="end" className="fill-foreground text-xs">
                            {roomEnvironment.mur_d_materiau ? `D - ${roomEnvironment.mur_d_materiau}` : "D"}
                            {roomEnvironment.mur_principal === "D" && " 🖥️"}
                          </text>

                          {/* Dimensions */}
                          <text x={50 + svgWidth / 2} y={svgHeight + 85} textAnchor="middle" className="fill-muted-foreground text-xs">
                            {roomEnvironment.width_m} m
                          </text>
                          <text x={25} y={50 + svgHeight / 2} textAnchor="middle" className="fill-muted-foreground text-xs" transform={`rotate(-90 25 ${50 + svgHeight / 2})`}>
                            {roomEnvironment.length_m} m
                          </text>
                        </svg>
                      );
                    })()}
                  </div>
                  <div className="text-sm space-y-1">
                    {roomEnvironment.mur_a_materiau && <p>• Mur A (haut) : {roomEnvironment.mur_a_materiau}</p>}
                    {roomEnvironment.mur_b_materiau && <p>• Mur B (droite) : {roomEnvironment.mur_b_materiau}</p>}
                    {roomEnvironment.mur_c_materiau && <p>• Mur C (bas) : {roomEnvironment.mur_c_materiau}</p>}
                    {roomEnvironment.mur_d_materiau && <p>• Mur D (gauche) : {roomEnvironment.mur_d_materiau}</p>}
                    {roomEnvironment.mur_principal && (
                      <p className="neon-blue font-semibold mt-2">🖥️ Mur principal (diffuseur) : Mur {roomEnvironment.mur_principal}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Affichage visuel des photos */}
            {photos && photos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold neon-yellow flex items-center gap-2">
                  🖼️ Photos de la salle
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => {
                    const photoUrl = getPhotoUrl(photo.name);
                    const photoName = photo.name.split('_').slice(1).join('_') || `Photo ${index + 1}`;
                    return (
                      <div key={photo.name} className="glass neon-border-yellow p-2 rounded-lg space-y-2">
                        <img
                          src={photoUrl}
                          alt={photoName}
                          className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-xs text-muted-foreground truncate">{photoName}</p>
                        <p className="text-xs text-muted-foreground/50 truncate font-mono">{photoUrl}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Technical Validation */}
        {room?.validation_technique_statut && (
          <Card className={`glass p-6 ${
            room.validation_technique_statut === "OK" 
              ? "neon-border-green" 
              : room.validation_technique_statut === "AVERTISSEMENTS" 
              ? "neon-border-yellow" 
              : "neon-border-red"
          }`}>
            <CardHeader>
              <CardTitle className={
                room.validation_technique_statut === "OK" 
                  ? "text-green-400" 
                  : room.validation_technique_statut === "AVERTISSEMENTS" 
                  ? "neon-yellow" 
                  : "text-destructive"
              }>
                {room.validation_technique_statut === "OK" && "✅ Validation technique : OK"}
                {room.validation_technique_statut === "AVERTISSEMENTS" && "⚠️ Validation technique : Avertissements"}
                {room.validation_technique_statut === "ERREURS" && "❌ Validation technique : Erreurs"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {room.validation_technique_details && room.validation_technique_details.length > 0 && (
                <ul className="space-y-2 text-sm">
                  {room.validation_technique_details.map((detail: string, i: number) => (
                    <li key={i} className={
                      detail.startsWith("❌") 
                        ? "text-destructive" 
                        : detail.startsWith("⚠️") 
                        ? "text-yellow-500" 
                        : ""
                    }>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usage Scenarios */}
        <Card className="glass neon-border-purple p-6">
          <CardHeader>
            <CardTitle className="text-purple-400">📋 Scénarios d'usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Générez automatiquement 2-3 scénarios concrets d'utilisation de la salle pour enrichir votre discours commercial.
            </p>
            <Button
              onClick={generateScenarios}
              disabled={isGeneratingScenarios}
              className="w-full neon-border-purple"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingScenarios ? "Génération en cours..." : "Générer des scénarios d'usage (IA)"}
            </Button>
            
            {room?.scenarios_usage && (
              <div className="space-y-4 mt-4">
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap bg-background/50 p-4 rounded-lg border border-border">
                  {room.scenarios_usage}
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(room.scenarios_usage);
                    toast.success("Scénarios copiés");
                  }}
                  variant="secondary"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier les scénarios
                </Button>
              </div>
            )}
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
                  {room.critical_errors_ia.map((error: any, i: number) => (
                    <li key={i} className="text-destructive">
                      {typeof error === 'string' ? error : error.message || JSON.stringify(error)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {room.warnings_ia && room.warnings_ia.length > 0 && (
              <div className="border-yellow-500/50 bg-yellow-500/10 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-500 mb-2">Avertissements</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {room.warnings_ia.map((warning: any, i: number) => (
                    <li key={i} className="text-yellow-500">
                      {typeof warning === 'string' ? warning : warning.message || JSON.stringify(warning)}
                    </li>
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
              <div className="flex gap-2 flex-wrap">
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
                <Button
                  onClick={() => {
                    // Generate full AI report
                    let aiReport = `# Analyse IA - ${room.name}\n`;
                    aiReport += `Projet: ${room.projects?.client_name || "N/A"}\n`;
                    aiReport += `Date: ${new Date().toLocaleDateString("fr-FR")}\n\n`;
                    
                    if (room.critical_errors_ia && room.critical_errors_ia.length > 0) {
                      aiReport += `## ⚠️ ERREURS CRITIQUES\n\n`;
                      room.critical_errors_ia.forEach((error: any) => {
                        const errorText = typeof error === "string" ? error : error.message || JSON.stringify(error);
                        aiReport += `- ❌ ${errorText}\n`;
                      });
                      aiReport += `\n`;
                    }
                    
                    if (room.warnings_ia && room.warnings_ia.length > 0) {
                      aiReport += `## ⚡ AVERTISSEMENTS\n\n`;
                      room.warnings_ia.forEach((warning: any) => {
                        const warningText = typeof warning === "string" ? warning : warning.message || JSON.stringify(warning);
                        aiReport += `- ⚠️ ${warningText}\n`;
                      });
                      aiReport += `\n`;
                    }
                    
                    if (room.audio_config_ia) {
                      const audioConfig = room.audio_config_ia as any;
                      aiReport += `## 🔊 CONFIGURATION AUDIO RECOMMANDÉE\n\n`;
                      aiReport += `- Type de sonorisation: ${audioConfig.type_sonorisation || "N/A"}\n`;
                      if (audioConfig.ambiance?.active) {
                        aiReport += `- Ambiance: ${audioConfig.ambiance.description}\n`;
                      }
                      if (audioConfig.puissance?.active) {
                        aiReport += `- Puissance: ${audioConfig.puissance.niveau} - ${audioConfig.puissance.description}\n`;
                      }
                      if (audioConfig.diffusion?.homogene) {
                        aiReport += `- Diffusion: ${audioConfig.diffusion.mode?.join(", ") || "N/A"} (${audioConfig.diffusion.approx_nb_enceintes || 0} enceintes approx.)\n`;
                      }
                      aiReport += `- DSP: ${audioConfig.traitement?.dsp_recommande ? "Recommandé" : "Non nécessaire"}\n`;
                      aiReport += `- Dante: ${audioConfig.traitement?.dante_recommande ? "Recommandé" : "Non nécessaire"}\n`;
                      aiReport += `\n`;
                    }
                    
                    aiReport += `## 📋 RÉSUMÉ TECHNIQUE\n\n`;
                    aiReport += room.resume_technique_ia || "Aucun résumé disponible";
                    
                    // Download as file
                    const blob = new Blob([aiReport], { type: "text/plain;charset=utf-8" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `analyse-ia-${room.name.replace(/[^a-zA-Z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success("Compte rendu IA exporté");
                  }}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exporter le compte rendu IA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </>
  );
};
