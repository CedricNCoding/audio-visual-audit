import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface RoomSummaryProps {
  roomId: string;
}

export const RoomSummary = ({ roomId }: RoomSummaryProps) => {
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

  const handleExportText = () => {
    let text = `═══════════════════════════════════════════════════════\n`;
    text += `       COMPTE RENDU TECHNIQUE AUDIOVISUEL\n`;
    text += `═══════════════════════════════════════════════════════\n\n`;

    // A. Informations projet
    text += `┌─────────────────────────────────────────────────────┐\n`;
    text += `│ A. INFORMATIONS PROJET                              │\n`;
    text += `└─────────────────────────────────────────────────────┘\n`;
    text += `Client: ${room?.projects?.client_name || "N/A"}\n`;
    text += `Site: ${room?.projects?.site_name || "N/A"}\n`;
    text += `Contact: ${room?.projects?.contact_name || "N/A"}\n`;
    text += `Service décideur: ${room?.projects?.decision_service || "N/A"}\n`;
    text += `Contact décideur: ${room?.projects?.decision_contact || "N/A"}\n`;
    text += `Date de décision: ${room?.projects?.decision_date || "N/A"}\n\n`;

    // B. Informations salle
    text += `┌─────────────────────────────────────────────────────┐\n`;
    text += `│ B. INFORMATIONS SALLE                               │\n`;
    text += `└─────────────────────────────────────────────────────┘\n`;
    text += `Nom de la salle: ${room?.name}\n`;
    text += `Typologie: ${room?.typology || "N/A"}\n`;
    if (roomUsage) {
      text += `Nombre de personnes: ${roomUsage.nombre_personnes || "N/A"}\n`;
      text += `Usage principal: ${roomUsage.main_usage || "N/A"}\n`;
      text += `Intensité d'usage: ${roomUsage.usage_intensity || "N/A"}\n`;
      text += `Niveau de compétence: ${roomUsage.user_skill_level || "N/A"}\n`;
      text += `Plateforme visio: ${roomUsage.platform_type || "N/A"}\n`;
      text += `Réservation de salle: ${roomUsage.reservation_salle ? "Oui" : "Non"}\n`;
    }
    text += `\n`;

    // C. Environnement
    if (roomEnvironment) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ C. ENVIRONNEMENT PHYSIQUE                           │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      text += `Dimensions: ${roomEnvironment.length_m || "?"}m x ${roomEnvironment.width_m || "?"}m x ${roomEnvironment.height_m || "?"}m\n`;
      text += `Matériaux murs: ${roomEnvironment.wall_material || "N/A"}\n`;
      text += `Matériaux sol: ${roomEnvironment.floor_material || "N/A"}\n`;
      text += `Matériaux plafond: ${roomEnvironment.ceiling_material || "N/A"}\n`;
      text += `Plancher technique: ${roomEnvironment.has_raised_floor ? "Oui" : "Non"}\n`;
      text += `Faux plafond technique: ${roomEnvironment.has_false_ceiling ? "Oui" : "Non"}\n`;
      text += `Luminosité: ${roomEnvironment.brightness_level || "N/A"}\n`;
      text += `Problème acoustique: ${roomEnvironment.has_acoustic_issue ? "Oui" : "Non"}\n`;
      if (roomEnvironment.acoustic_comment) {
        text += `Commentaire acoustique: ${roomEnvironment.acoustic_comment}\n`;
      }
      text += `\n`;
    }

    // D. Visio / Streaming
    if (roomVisio) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ D. VISIOCONFÉRENCE & STREAMING                      │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      text += `Visio nécessaire: ${roomVisio.visio_required ? "Oui" : "Non"}\n`;
      text += `Besoin en streaming: ${roomVisio.streaming_enabled ? "Oui" : "Non"}\n`;
      text += `Besoin de voir: ${roomVisio.need_to_see ? "Oui" : "Non"}\n`;
      text += `Besoin d'être vu: ${roomVisio.need_to_be_seen ? "Oui" : "Non"}\n`;
      text += `Besoin d'entendre: ${roomVisio.need_to_hear ? "Oui" : "Non"}\n`;
      text += `Besoin d'être entendu: ${roomVisio.need_to_be_heard ? "Oui" : "Non"}\n`;
      text += `Nombre de caméras: ${roomVisio.camera_count || 0}\n`;
      if (roomVisio.camera_types && roomVisio.camera_types.length > 0) {
        text += `Types de caméras: ${roomVisio.camera_types.join(", ")}\n`;
      }
      text += `Nombre de micros: ${roomVisio.mic_count || 0}\n`;
      if (roomVisio.mic_types && roomVisio.mic_types.length > 0) {
        text += `Types de micros: ${roomVisio.mic_types.join(", ")}\n`;
      }
      if (roomVisio.streaming_enabled) {
        text += `Type de streaming: ${roomVisio.streaming_type || "N/A"}\n`;
        text += `Plateforme streaming: ${roomVisio.streaming_platform || "N/A"}\n`;
        text += `Complexité streaming: ${roomVisio.streaming_complexity || "N/A"}\n`;
      }
      text += `\n`;
    }

    // E. Sources en régie
    if (sources && sources.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ E. SOURCES EN RÉGIE                                 │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      sources.forEach((s) => {
        text += `• ${s.source_type} - Quantité: ${s.quantity}\n`;
      });
      text += `\n`;
    }

    // F. Diffuseurs
    if (displays && displays.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ F. DIFFUSEURS                                       │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      displays.forEach((d) => {
        text += `• ${d.display_type}\n`;
        text += `  - Taille: ${d.size_inches}"\n`;
        text += `  - Position: ${d.position || "N/A"}\n`;
        if (d.display_type === "Vidéoprojecteur") {
          if (d.distance_projection_m) text += `  - Distance projection: ${d.distance_projection_m}m\n`;
          if (d.base_ecran_cm) text += `  - Base écran: ${d.base_ecran_cm}cm\n`;
        }
        if (d.viewer_distance_m) text += `  - Distance spectateur: ${d.viewer_distance_m}m\n`;
        if (d.bottom_height_cm) text += `  - Hauteur bas écran: ${d.bottom_height_cm}cm\n`;
      });
      text += `\n`;
    }

    // G. Connectique utilisateur
    if (connectivityZones && connectivityZones.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ G. CONNECTIQUE UTILISATEUR                          │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      connectivityZones.forEach((zone) => {
        text += `Zone: ${zone.zone_name}\n`;
        if (zone.hdmi_count > 0) text += `  - HDMI: ${zone.hdmi_count}\n`;
        if (zone.usbc_count > 0) text += `  - USB-C: ${zone.usbc_count}\n`;
        if (zone.displayport_count > 0) text += `  - DisplayPort: ${zone.displayport_count}\n`;
        if (zone.rj45_count > 0) text += `  - RJ45: ${zone.rj45_count}\n`;
        if (zone.usba_count > 0) text += `  - USB-A: ${zone.usba_count}\n`;
        if (zone.power_230v_count > 0) text += `  - Prises 230V: ${zone.power_230v_count}\n`;
        if (zone.distance_to_control_room_m > 0) text += `  - Distance vers régie: ${zone.distance_to_control_room_m}m\n`;
        text += `\n`;
      });
    }

    // H. Liaisons & câbles
    if (cables && cables.length > 0) {
      text += `┌─────────────────────────────────────────────────────┐\n`;
      text += `│ H. LIAISONS & CÂBLES                                │\n`;
      text += `└─────────────────────────────────────────────────────┘\n`;
      cables.forEach((cable) => {
        text += `• ${cable.point_a} → ${cable.point_b}\n`;
        text += `  - Type signal: ${cable.signal_type}\n`;
        text += `  - Distance: ${cable.distance_m}m (avec marge: ${cable.distance_with_margin_m}m)\n`;
        text += `  - Recommandation: ${cable.cable_recommendation}\n`;
      });
      text += `\n`;
    }

    text += `═══════════════════════════════════════════════════════\n`;
    text += `          Fin du compte rendu technique\n`;
    text += `═══════════════════════════════════════════════════════\n`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compte-rendu-${room?.name?.replace(/\s/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export texte téléchargé");
  };

  return (
    <div className="space-y-4">
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

      <Card className="glass neon-border-yellow">
        <CardHeader>
          <CardTitle className="neon-yellow">Export</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={handleExportText} className="flex-1 bg-secondary hover:bg-secondary/80">
            <Download className="h-4 w-4 mr-2" />
            Exporter en texte
          </Button>
          <Button
            onClick={() => toast.info("Export PDF sera disponible prochainement")}
            className="flex-1"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter en PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
