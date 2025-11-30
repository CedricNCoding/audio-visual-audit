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

  const handleExportText = () => {
    let text = `COMPTE RENDU TECHNIQUE - ${room?.name}\n\n`;
    text += `Client: ${room?.projects?.client_name}\n`;
    text += `Typologie: ${room?.typology || "N/A"}\n\n`;

    if (roomUsage) {
      text += `=== USAGE & CONTEXTE ===\n`;
      text += `Usage principal: ${roomUsage.main_usage || "N/A"}\n`;
      text += `Intensité: ${roomUsage.usage_intensity || "N/A"}\n`;
      text += `Nombre de personnes: ${roomUsage.nombre_personnes || "N/A"}\n`;
      text += `Réservation: ${roomUsage.reservation_salle ? "Oui" : "Non"}\n\n`;
    }

    if (roomEnvironment) {
      text += `=== ENVIRONNEMENT ===\n`;
      text += `Dimensions: ${roomEnvironment.length_m}m x ${roomEnvironment.width_m}m x ${roomEnvironment.height_m}m\n\n`;
    }

    if (sources && sources.length > 0) {
      text += `=== SOURCES EN RÉGIE ===\n`;
      sources.forEach((s) => {
        text += `- ${s.source_type} (x${s.quantity})\n`;
      });
      text += `\n`;
    }

    if (displays && displays.length > 0) {
      text += `=== DIFFUSEURS ===\n`;
      displays.forEach((d) => {
        text += `- ${d.display_type} ${d.size_inches}" (${d.position})\n`;
      });
      text += `\n`;
    }

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compte-rendu-${room?.name?.replace(/\s/g, "-")}.txt`;
    a.click();
    toast.success("Export texte téléchargé");
  };

  return (
    <div className="space-y-6">
      <Card className="glass neon-border-yellow">
        <CardHeader>
          <CardTitle className="neon-yellow">Résumé & Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Informations générales</h3>
            <p>Salle: {room?.name}</p>
            <p>Typologie: {room?.typology || "N/A"}</p>
            <p>Nombre de personnes: {roomUsage?.nombre_personnes || "N/A"}</p>
          </div>

          {sources && sources.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Sources en régie ({sources.length})</h3>
              <ul className="list-disc list-inside">
                {sources.map((s) => (
                  <li key={s.id}>
                    {s.source_type} x{s.quantity}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {displays && displays.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Diffuseurs ({displays.length})</h3>
              <ul className="list-disc list-inside">
                {displays.map((d) => (
                  <li key={d.id}>
                    {d.display_type} {d.size_inches}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
