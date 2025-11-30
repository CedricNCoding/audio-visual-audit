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

    // Section 7 – Connectique utilisateur
    if (connectivityZones && connectivityZones.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 7 – CONNECTIQUE UTILISATEUR                 │\n`;
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

    // Section 8 – Liaisons & câbles
    if (cables && cables.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ Section 8 – LIAISONS & CÂBLES                       │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      cables.forEach((cable) => {
        text += `• ${cable.point_a} → ${cable.point_b} – ${cable.signal_type} – ${cable.distance_m}m (${cable.distance_with_margin_m}m avec marge) – ${cable.cable_recommendation}\n`;
      });
      text += `\n`;
    }

    // Section 9 – Synthèse
    text += `┌─────────────────────────────────────────────────────┐\n`;
    text += `│ Section 9 – SYNTHÈSE                                │\n`;
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
            <Button onClick={copyToClipboard} variant="secondary">
              <Copy className="h-4 w-4 mr-2" />
              Copier le texte
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Note : L'export PDF sera disponible prochainement
          </p>
        </CardContent>
      </Card>
      
      <Card className="glass neon-border-yellow">
        <CardHeader>
          <CardTitle className="neon-yellow">A. Informations Projet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Client:</strong> {room?.projects?.client_name || "N/A"}</p>
          <p><strong>Site:</strong> {room?.projects?.site_name || "N/A"}</p>
          <p><strong>Contact:</strong> {room?.projects?.contact_name || "N/A"}</p>
          <p><strong>Service décideur:</strong> {room?.projects?.decision_service || "N/A"}</p>
          <p><strong>Contact décideur:</strong> {room?.projects?.decision_contact || "N/A"}</p>
          <p><strong>Date de décision:</strong> {room?.projects?.decision_date || "N/A"}</p>
        </CardContent>
      </Card>

      <Card className="glass neon-border-yellow">
        <CardHeader>
          <CardTitle className="neon-yellow">B. Informations Salle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Nom:</strong> {room?.name}</p>
          <p><strong>Typologie:</strong> {room?.typology || "N/A"}</p>
          {roomUsage && (
            <>
              <p><strong>Nombre de personnes:</strong> {roomUsage.nombre_personnes || "N/A"}</p>
              <p><strong>Usage principal:</strong> {roomUsage.main_usage || "N/A"}</p>
              <p><strong>Intensité d'usage:</strong> {roomUsage.usage_intensity || "N/A"}</p>
              <p><strong>Niveau de compétence:</strong> {roomUsage.user_skill_level || "N/A"}</p>
              <p><strong>Plateforme visio:</strong> {roomUsage.platform_type || "N/A"}</p>
              <p><strong>Réservation:</strong> {roomUsage.reservation_salle ? "Oui" : "Non"}</p>
            </>
          )}
        </CardContent>
      </Card>

      {roomEnvironment && (
        <Card className="glass neon-border-blue">
          <CardHeader>
            <CardTitle className="neon-blue">C. Environnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Dimensions:</strong> {roomEnvironment.length_m || "?"}m × {roomEnvironment.width_m || "?"}m × {roomEnvironment.height_m || "?"}m</p>
            <p><strong>Matériaux murs:</strong> {roomEnvironment.wall_material || "N/A"}</p>
            <p><strong>Matériaux sol:</strong> {roomEnvironment.floor_material || "N/A"}</p>
            <p><strong>Matériaux plafond:</strong> {roomEnvironment.ceiling_material || "N/A"}</p>
            <p><strong>Plancher technique:</strong> {roomEnvironment.has_raised_floor ? "Oui" : "Non"}</p>
            <p><strong>Faux plafond:</strong> {roomEnvironment.has_false_ceiling ? "Oui" : "Non"}</p>
            <p><strong>Luminosité:</strong> {roomEnvironment.brightness_level || "N/A"}</p>
            <p><strong>Problème acoustique:</strong> {roomEnvironment.has_acoustic_issue ? "Oui" : "Non"}</p>
            {roomEnvironment.acoustic_comment && (
              <p><strong>Commentaire:</strong> {roomEnvironment.acoustic_comment}</p>
            )}
          </CardContent>
        </Card>
      )}

      {roomVisio && (
        <Card className="glass neon-border-blue">
          <CardHeader>
            <CardTitle className="neon-blue">D. Visio & Streaming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Visio nécessaire:</strong> {roomVisio.visio_required ? "Oui" : "Non"}</p>
            <p><strong>Besoin en streaming:</strong> {roomVisio.streaming_enabled ? "Oui" : "Non"}</p>
            <p><strong>Voir / Être vu:</strong> {roomVisio.need_to_see ? "Oui" : "Non"} / {roomVisio.need_to_be_seen ? "Oui" : "Non"}</p>
            <p><strong>Entendre / Être entendu:</strong> {roomVisio.need_to_hear ? "Oui" : "Non"} / {roomVisio.need_to_be_heard ? "Oui" : "Non"}</p>
            <p><strong>Caméras:</strong> {roomVisio.camera_count || 0} {roomVisio.camera_types?.length > 0 && `(${roomVisio.camera_types.join(", ")})`}</p>
            <p><strong>Micros:</strong> {roomVisio.mic_count || 0} {roomVisio.mic_types?.length > 0 && `(${roomVisio.mic_types.join(", ")})`}</p>
            {roomVisio.streaming_enabled && (
              <>
                <p><strong>Type streaming:</strong> {roomVisio.streaming_type || "N/A"}</p>
                <p><strong>Plateforme:</strong> {roomVisio.streaming_platform || "N/A"}</p>
                <p><strong>Complexité:</strong> {roomVisio.streaming_complexity || "N/A"}</p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {sources && sources.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>E. Sources en Régie ({sources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {sources.map((s) => (
                <li key={s.id}>• {s.source_type} - Quantité: {s.quantity}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {displays && displays.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>F. Diffuseurs ({displays.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {displays.map((d) => (
                <li key={d.id} className="border-b pb-2 last:border-0">
                  <p><strong>{d.display_type}</strong> - {d.size_inches}" - {d.position}</p>
                  {d.display_type === "Vidéoprojecteur" && (
                    <p className="text-sm text-muted-foreground">
                      {d.distance_projection_m && `Distance projection: ${d.distance_projection_m}m`}
                      {d.base_ecran_cm && ` • Base: ${d.base_ecran_cm}cm`}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {connectivityZones && connectivityZones.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>G. Connectique Utilisateur ({connectivityZones.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {connectivityZones.map((zone) => (
                <li key={zone.id} className="border-b pb-2 last:border-0">
                  <p><strong>{zone.zone_name}</strong></p>
                  <div className="text-sm text-muted-foreground">
                    {zone.hdmi_count > 0 && <span>HDMI: {zone.hdmi_count} • </span>}
                    {zone.usbc_count > 0 && <span>USB-C: {zone.usbc_count} • </span>}
                    {zone.displayport_count > 0 && <span>DisplayPort: {zone.displayport_count} • </span>}
                    {zone.rj45_count > 0 && <span>RJ45: {zone.rj45_count}</span>}
                    {zone.distance_to_control_room_m > 0 && (
                      <p className="text-primary">Distance vers régie: {zone.distance_to_control_room_m}m</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {cables && cables.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>H. Liaisons & Câbles ({cables.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {cables.map((cable) => (
                <li key={cable.id} className="border-b pb-2 last:border-0">
                  <p><strong>{cable.point_a} → {cable.point_b}</strong></p>
                  <p className="text-sm">Signal: {cable.signal_type} • Distance: {cable.distance_m}m (marge: {cable.distance_with_margin_m}m)</p>
                  <p className="text-sm text-primary">💡 {cable.cable_recommendation}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
