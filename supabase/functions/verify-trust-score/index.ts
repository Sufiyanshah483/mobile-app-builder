import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing URL:", url);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a fact-checking and source verification AI assistant for FactGuard. Your task is to analyze news URLs and provide trust assessments.

Analyze the provided URL and return a structured assessment using the suggest_trust_score function. Consider:

1. **Source Reputation**: Is this a known, established news organization? What is their track record?
2. **Domain Age & History**: Is this a recently created domain potentially for misinformation?
3. **Content Quality Indicators**: Does the URL/domain suggest clickbait, sensationalism, or professional journalism?
4. **Known Fact-Check Flags**: Has this source been flagged by fact-checkers like Snopes, PolitiFact, etc.?

Trust Score Guidelines:
- HIGH (80-100): Established, reputable news sources with strong editorial standards (e.g., major newspapers, wire services, established broadcasters)
- MEDIUM (40-79): Sources that may have some bias or occasional accuracy issues, newer outlets, or opinion-heavy publications
- LOW (0-39): Sources known for misinformation, clickbait, satire presented as news, or unverified content

Always provide specific reasoning and actionable advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this URL for trustworthiness: ${url}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_trust_score",
              description: "Return a trust score assessment for the URL",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Trust score from 0-100",
                  },
                  level: {
                    type: "string",
                    enum: ["HIGH", "MEDIUM", "LOW"],
                    description: "Trust level category",
                  },
                  source_name: {
                    type: "string",
                    description: "Name of the news source/publication",
                  },
                  summary: {
                    type: "string",
                    description: "Brief summary of the trust assessment (2-3 sentences)",
                  },
                  factors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        assessment: { type: "string", enum: ["positive", "neutral", "negative"] },
                        description: { type: "string" },
                      },
                      required: ["factor", "assessment", "description"],
                    },
                    description: "List of factors considered in the assessment",
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable recommendations for the user",
                  },
                },
                required: ["score", "level", "source_name", "summary", "factors", "recommendations"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_trust_score" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Invalid response from AI");
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Store in verification history
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    await supabase.from("verification_history").insert({
      user_id: userId,
      verification_type: "trust_score",
      input_content: url,
      result_score: result.level,
      result_verdict: result.summary,
      result_details: result,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in verify-trust-score:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
