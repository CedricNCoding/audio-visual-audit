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
    console.log("Generating usage scenarios for room:", roomId);

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

    // Fetch room data
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

    // Prepare context for AI
    const context = {
      room_name: room.name,
      typology: room.typology,
      usage: roomUsage?.main_usage,
      people_count: roomUsage?.nombre_personnes,
      visio_platform: roomVisio?.visio_platform,
      streaming: roomVisio?.streaming_enabled,
      sonorization: roomSonorization?.type_sonorisation,
      voice_reinforcement: roomSonorization?.renforcement_voix,
      sources: sources?.map(s => s.source_type),
      displays: displays?.map(d => d.display_type),
      byod: roomUsage?.platform_type?.toLowerCase().includes("byod"),
    };

    const systemPrompt = `Tu es un consultant audiovisuel expert.`;

    const userPrompt = `À partir de la description suivante d'une salle de réunion/formation, génère exactement 2 ou 3 scénarios d'usage concrets, orientés utilisateur final, en français.

Description de la salle :
${JSON.stringify(context, null, 2)}

Chaque scénario doit avoir :
- un titre court et descriptif (max 6 mots)
- un paragraphe décrivant comment la salle est utilisée (qui fait quoi, avec quel équipement, dans quel contexte)

Le ton doit être professionnel mais accessible, orienté bénéfice utilisateur.
Format de réponse : retourne un objet JSON avec une propriété "scenarios" qui est un tableau d'objets avec les propriétés "title" et "description".

Exemple de format attendu :
{
  "scenarios": [
    {
      "title": "Réunion hybride simple",
      "description": "L'équipe se réunit dans la salle avec 8 personnes en présentiel. Le responsable lance la visioconférence sur Teams pour inclure 3 collègues distants. Le PC portable est branché en HDMI sur le grand écran, permettant à tous de voir les participants à distance et le support de présentation. Les micros plafond captent les voix de chacun automatiquement."
    }
  ]
}

NE GÉNÈRE QUE 2 OU 3 SCÉNARIOS MAXIMUM.`;

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
        max_completion_tokens: 1500,
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
    const result = JSON.parse(aiResponse.choices[0].message.content);

    // Format scenarios as text
    const scenariosText = result.scenarios
      .map((s: any, i: number) => `**Scénario ${i + 1} : ${s.title}**\n\n${s.description}`)
      .join("\n\n---\n\n");

    // Update room with scenarios
    const { error: updateError } = await supabase
      .from("rooms")
      .update({ scenarios_usage: scenariosText })
      .eq("id", roomId);

    if (updateError) throw updateError;

    console.log("Scenarios generated successfully");

    return new Response(
      JSON.stringify({ scenarios: result.scenarios, text: scenariosText }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-scenarios function:", error);
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
