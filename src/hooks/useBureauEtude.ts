import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBureauEtude = () => {
  const { data: isBureauEtude, isLoading } = useQuery({
    queryKey: ["is_bureau_etude"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_bureau_etude");
      if (error) {
        console.error("Error checking bureau etude status:", error);
        return false;
      }
      return data === true;
    },
  });

  return { isBureauEtude: isBureauEtude ?? false, isLoading };
};
