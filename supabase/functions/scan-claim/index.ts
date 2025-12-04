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
    const { claim } = await req.json();
    
    if (!claim) {
      return new Response(
        JSON.stringify({ error: "Claim text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Scanning claim:", claim);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a fact-checking AI assistant for FactGuard. Your task is to analyze claims and verify them against known facts.

Analyze the provided claim and return a structured assessment using the verify_claim function. Consider:

1. **Claim Extraction**: Identify the core verifiable claim(s) in the text
2. **Fact-Check Status**: Has this claim been verified by fact-checkers (Snopes, PolitiFact, AFP Fact Check, etc.)?
3. **Evidence Assessment**: What evidence supports or contradicts this claim?
4. **Context**: Is important context missing that changes the meaning?

Verdict Guidelines:
- TRUE: The claim is accurate and supported by credible evidence
- MOSTLY_TRUE: The claim is largely accurate but may need minor clarification
- MIXED: The claim contains both accurate and inaccurate elements
- MOSTLY_FALSE: The claim is largely inaccurate with some truth
- FALSE: The claim is demonstrably false
- UNVERIFIABLE: Not enough information to make a determination

Always cite your reasoning and suggest ways users can verify the information themselves.`;

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
          { role: "user", content: `Fact-check this claim: "${claim}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "verify_claim",
              description: "Return a fact-check assessment for the claim",
              parameters: {
                type: "object",
                properties: {
                  extracted_claim: {
                    type: "string",
                    description: "The core verifiable claim extracted from the input",
                  },
                  verdict: {
                    type: "string",
                    enum: ["TRUE", "MOSTLY_TRUE", "MIXED", "MOSTLY_FALSE", "FALSE", "UNVERIFIABLE"],
                    description: "The fact-check verdict",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence level 0-100 in the verdict",
                  },
                  summary: {
                    type: "string",
                    description: "Brief explanation of the verdict (2-3 sentences)",
                  },
                  evidence: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["supporting", "contradicting", "contextual"] },
                        description: { type: "string" },
                        source_type: { type: "string" },
                      },
                      required: ["type", "description", "source_type"],
                    },
                    description: "Evidence items considered",
                  },
                  fact_check_sources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        verdict: { type: "string" },
                        url_hint: { type: "string" },
                      },
                      required: ["name", "verdict"],
                    },
                    description: "Known fact-check sources that have covered this claim",
                  },
                  verification_tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tips for users to verify this themselves",
                  },
                },
                required: ["extracted_claim", "verdict", "confidence", "summary", "evidence", "verification_tips"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "verify_claim" } },
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
      verification_type: "claim_scan",
      input_content: claim,
      result_score: result.verdict,
      result_verdict: result.summary,
      result_details: result,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scan-claim:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
