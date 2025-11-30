import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roomId } = await req.json();
    console.log("Analyzing room:", roomId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get AI settings for the user
    const { data: aiSettings, error: aiSettingsError } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (aiSettingsError) {
      console.error("Error fetching AI settings:", aiSettingsError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la récupération des paramètres IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!aiSettings || !aiSettings.api_key) {
      return new Response(
        JSON.stringify({
          error: "Veuillez configurer vos paramètres IA dans Paramètres > IA",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch all room data
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*, projects(*)")
      .eq("id", roomId)
      .single();

    if (roomError) throw roomError;

    const { data: roomUsage } = await supabase
      .from("room_usage")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    const { data: roomEnvironment } = await supabase
      .from("room_environment")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    const { data: roomVisio } = await supabase
      .from("room_visio")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    const { data: roomSonorization } = await supabase
      .from("room_sonorization")
      .select("*")
      .eq("room_id", roomId)
      .maybeSingle();

    const { data: sources } = await supabase
      .from("sources")
      .select("*")
      .eq("room_id", roomId);

    const { data: displays } = await supabase
      .from("displays")
      .select("*")
      .eq("room_id", roomId);

    const { data: cables } = await supabase
      .from("cables")
      .select("*")
      .eq("room_id", roomId);

    const { data: connectivityZones } = await supabase
      .from("connectivity_zones")
      .select("*")
      .eq("room_id", roomId);

    // Prepare the JSON for AI
    const roomData = {
      project: room.projects,
      room: {
        name: room.name,
        typology: room.typology,
      },
      usage: roomUsage,
      environment: roomEnvironment,
      visio: roomVisio,
      sonorization: roomSonorization,
      sources: sources || [],
      displays: displays || [],
      cables: cables || [],
      connectivity: connectivityZones || [],
      ai_params: {
        max_hdmi_m: aiSettings.max_hdmi_m,
        max_hdbaset_m: aiSettings.max_hdbaset_m,
      },
    };

    console.log("Prepared room data for AI analysis");

    // Call OpenAI API
    const systemPrompt = `Tu es un ingénieur audiovisuel expert (vidéo + audio + réseau + streaming).
Tu reçois un JSON décrivant une salle : sources, diffuseurs, micros, caméras, visio, distances, connectique, sonorisation, acoustique, environnement, etc.
Ton rôle est de déduire et proposer une architecture complète, rigoureuse, exploitable par un intégrateur audiovisuel professionnel.`;

    const userPrompt = `Analyse le JSON fourni et produis une réponse JSON STRICTE contenant :

1. **links** : la liste complète des liaisons recommandées (vidéo, USB, réseau, audio). Pour chaque liaison :
   - id (unique)
   - from
   - to
   - signal_type (HDMI, HDBaseT, AVoIP, USB, RJ45, Audio analogique, Dante…)
   - transport (HDMI direct / HDBaseT / AVoIP / USB actif / RJ45 / XLR…)
   - comment (explication brève)

2. **audio_links** : uniquement les liaisons audio (micros → DSP, DSP → ampli, ampli → enceintes…)

3. **audio_config** : une configuration audio complète dérivée de la sonorisation saisie :
   - type_sonorisation (Ambiance / Conférence / Mixte)
   - ambiance (active + description)
   - puissance (active + niveau + besoins)
   - diffusion (homogene, type_diffusion, approx_nb_enceintes, zones recommandées)
   - traitement (dsp_recommande, dante_recommande)

4. **user_connectivity** : connectique utilisateur recommandée (HDMI, USB-C, RJ45…), avec explications.

5. **warnings** : avertissements (distance trop longue, manque de connectique, conflit de topologie…)

6. **critical_errors** : erreurs bloquantes (visio sans réseau, renforcement voix sans puissance sonore, micros incompatibles avec l'acoustique…)

7. **debug** : explication détaillée des choix techniques (transport, matrice, DSP, HF, acoustique…)

8. **summary_text** : un texte structuré en français, destiné à être intégré dans un devis. Le texte doit inclure :
   - Contexte du projet
   - Description de la salle
   - Recommandations vidéo
   - Recommandations sonorisation
   - Topologie câblage
   - Points de vigilance
   - Erreurs critiques éventuelles

Ne jamais sortir de JSON.
Ne jamais commenter en dehors du JSON.

Voici les données de la salle :
${JSON.stringify(roomData, null, 2)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiSettings.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiSettings.model_name,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: `Erreur API OpenAI: ${response.status} - ${errorText}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResponse = await response.json();
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);

    console.log("AI analysis completed successfully");

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-room function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});