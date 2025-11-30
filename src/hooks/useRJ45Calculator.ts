import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RoomData {
  roomId: string;
  visioRequired?: boolean;
  streamingEnabled?: boolean;
  danteSouhaite?: boolean;
  sources?: Array<{ source_type: string }>;
  platformType?: string;
}

export const useRJ45Calculator = () => {
  const queryClient = useQueryClient();

  const calculateAndUpdate = useMutation({
    mutationFn: async (data: RoomData) => {
      let rackCount = 0;
      let tableCount = 0;
      let otherCount = 0;
      const comments: string[] = [];

      // Rack calculations
      if (data.visioRequired) {
        rackCount += 1;
        comments.push("visio");
      }
      if (data.streamingEnabled) {
        rackCount += 1;
        comments.push("streaming");
      }
      if (data.danteSouhaite) {
        rackCount += 1;
        comments.push("Dante");
      }
      const hasPlayerSignage = data.sources?.some(s => s.source_type === "Player signage");
      if (hasPlayerSignage) {
        rackCount += 1;
        comments.push("Player signage");
      }

      // Table calculations
      if (data.platformType?.toLowerCase().includes("byod") || data.platformType?.toLowerCase().includes("sans-fil")) {
        tableCount += 1;
        comments.push("BYOD");
      }

      // Other calculations
      const hasNetworkDevices = data.sources?.some(s => 
        s.source_type.toLowerCase().includes("réseau") || 
        s.source_type.toLowerCase().includes("pc")
      );
      if (hasNetworkDevices) {
        otherCount += 1;
      }

      const total = rackCount + tableCount + otherCount;
      const commentText = comments.length > 0 
        ? `Prises prévues pour ${comments.join(", ")}`
        : "Prises réseau de base";

      const { error } = await supabase
        .from("rooms")
        .update({
          rj45_rack_recommande: rackCount,
          rj45_table_recommande: tableCount,
          rj45_autres_recommande: otherCount,
          rj45_total_recommande: total,
          rj45_commentaire: commentText,
        })
        .eq("id", data.roomId);

      if (error) throw error;
      return { rackCount, tableCount, otherCount, total };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["room", variables.roomId] });
    },
  });

  return { calculateAndUpdate };
};
