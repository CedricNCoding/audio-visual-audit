import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Video, Monitor, Volume2, Ruler } from "lucide-react";

interface RoomRecapProps {
  roomId: string;
}

export const RoomRecap = ({ roomId }: RoomRecapProps) => {
  const { data: room } = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
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

  const missingItems = [];
  if (!roomEnvironment?.length_m || !roomEnvironment?.width_m) missingItems.push("Dimensions de la salle");
  if (!roomEnvironment?.mur_principal) missingItems.push("Mur principal");
  if (!roomUsage?.main_usage) missingItems.push("Usage principal");
  if (!roomVisio?.visio_platform) missingItems.push("Plateforme visio");
  if (!displays || displays.length === 0) missingItems.push("Au moins un diffuseur");

  return (
    <Card className="glass neon-border-blue">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Rappel des informations essentielles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-primary" />
              <span className="font-medium">Type de salle :</span>
              <span className="text-muted-foreground">{room?.typology || "Non défini"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Usage :</span>
              <span className="text-muted-foreground">{roomUsage?.main_usage || "Non défini"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">Personnes :</span>
              <span className="text-muted-foreground">{roomUsage?.nombre_personnes || "Non défini"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-primary" />
              <span className="font-medium">Plateforme visio :</span>
              <span className="text-muted-foreground">{roomVisio?.visio_platform || "Non défini"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-primary" />
              <span className="font-medium">Mur principal :</span>
              <span className="text-muted-foreground">
                {roomEnvironment?.mur_principal ? `Mur ${roomEnvironment.mur_principal}` : "Non défini"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Ruler className="h-4 w-4 text-primary" />
              <span className="font-medium">Dimensions :</span>
              <span className="text-muted-foreground">
                {roomEnvironment?.length_m && roomEnvironment?.width_m
                  ? `${roomEnvironment.length_m} × ${roomEnvironment.width_m} m`
                  : "Non définies"}
              </span>
            </div>
          </div>
        </div>

        {missingItems.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
            <p className="text-sm font-medium text-yellow-500 mb-2">⚠️ Éléments manquants :</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {missingItems.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
