import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ValidationData {
  roomId: string;
  cables?: Array<{ signal_type: string; distance_with_margin_m?: number; point_a: string; point_b: string }>;
  environment?: {
    length_m?: number;
    width_m?: number;
    height_m?: number;
    mur_a_materiau?: string;
    mur_b_materiau?: string;
    mur_c_materiau?: string;
    mur_d_materiau?: string;
    mur_principal?: string;
  };
  sonorization?: {
    type_sonorization?: string;
    renforcement_voix?: boolean;
    nb_micros_renfort?: number;
    nb_micro_plafond_beamforming?: number;
    acoustique_niveau?: string;
    anti_larsen?: boolean;
    dsp_necessaire?: boolean;
  };
  visio?: {
    visio_required?: boolean;
    visio_platform?: string;
  };
  connectivity?: Array<{ usbc_count?: number; usba_count?: number }>;
  maxHdmiM?: number;
  maxHdbasetM?: number;
}

export const useTechnicalValidation = () => {
  const queryClient = useQueryClient();

  const validate = useMutation({
    mutationFn: async (data: ValidationData) => {
      const warnings: string[] = [];
      const errors: string[] = [];

      // Validate cable distances
      data.cables?.forEach(cable => {
        if (cable.signal_type === "HDMI" && cable.distance_with_margin_m && data.maxHdmiM) {
          if (cable.distance_with_margin_m > data.maxHdmiM) {
            warnings.push(
              `Liaison HDMI ${cable.point_a}→${cable.point_b} trop longue (${cable.distance_with_margin_m}m) pour HDMI direct, envisager HDBaseT ou AVoIP.`
            );
          }
        }
      });

      // Validate BYOD connectivity
      const platformType = data.visio?.visio_platform || "";
      const hasByod = platformType.toLowerCase().includes("byod") || platformType.toLowerCase().includes("sans-fil");
      const hasUsbC = data.connectivity?.some(z => (z.usbc_count || 0) > 0);
      const hasUsbA = data.connectivity?.some(z => (z.usba_count || 0) > 0);
      
      if (hasByod && !hasUsbC && !hasUsbA) {
        warnings.push("Salle BYOD sans USB-C / USB disponible à la table.");
      }

      // Validate acoustic + microphone configuration
      const acousticLevel = data.sonorization?.acoustique_niveau;
      const hasBeamforming = (data.sonorization?.nb_micro_plafond_beamforming || 0) > 0;
      const hasAntiLarsen = data.sonorization?.anti_larsen;

      if (acousticLevel === "Très réverbérée" && hasBeamforming && !hasAntiLarsen) {
        warnings.push("Micro plafond en salle très réverbérée sans anti-larsen : risque de larsen élevé.");
      }

      // Validate visio network
      if (data.visio?.visio_required) {
        // Check if there's network connectivity
        const hasNetwork = data.connectivity?.some(z => (z.usbc_count || 0) > 0);
        if (!hasNetwork) {
          errors.push("Visioconférence requise sans liaison réseau identifiée.");
        }
      }

      // Validate sonorization coherence
      const hasVoiceReinforcement = data.sonorization?.renforcement_voix;
      const sonoType = data.sonorization?.type_sonorization;
      
      if (hasVoiceReinforcement && sonoType === "Aucune sonorisation") {
        errors.push("Renforcement voix demandé mais aucune sonorisation définie.");
      }

      // Validate DSP for multiple microphones
      const nbMicros = data.sonorization?.nb_micros_renfort || 0;
      const needsDsp = data.sonorization?.dsp_necessaire;
      
      if (nbMicros > 2 && !needsDsp) {
        warnings.push("Plusieurs micros annoncés sans DSP prévu.");
      }

      // Determine status
      let status = "OK";
      if (errors.length > 0) {
        status = "ERREURS";
      } else if (warnings.length > 0) {
        status = "AVERTISSEMENTS";
      }

      const allMessages = [
        ...errors.map(e => `❌ ERREUR: ${e}`),
        ...warnings.map(w => `⚠️ AVERTISSEMENT: ${w}`)
      ];

      const { error } = await supabase
        .from("rooms")
        .update({
          validation_technique_statut: status,
          validation_technique_details: allMessages,
        })
        .eq("id", data.roomId);

      if (error) throw error;
      return { status, messages: allMessages };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
    },
  });

  return { validate };
};
