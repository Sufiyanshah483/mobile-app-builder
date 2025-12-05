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
    const { imageBase64, fileName, fileType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Supported: JPEG, PNG, WebP, GIF" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate base64 size (max ~10MB)
    if (imageBase64.length > 10 * 1024 * 1024 * 1.37) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 10MB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert digital forensics analyst specializing in detecting manipulated, AI-generated, and deepfake media. Analyze the provided image for signs of manipulation or artificial generation.

Your analysis MUST be returned as a valid JSON object with this exact structure:
{
  "verdict": "authentic" | "likely_manipulated" | "likely_ai_generated" | "inconclusive",
  "confidence": number between 0-100,
  "analysis_summary": "Brief 2-3 sentence summary of findings",
  "manipulation_indicators": [
    {
      "type": "artifact" | "inconsistency" | "metadata" | "pattern",
      "description": "Specific description of the indicator",
      "severity": "low" | "medium" | "high"
    }
  ],
  "authenticity_factors": [
    {
      "factor": "Description of factor supporting authenticity",
      "strength": "weak" | "moderate" | "strong"
    }
  ],
  "technical_analysis": {
    "lighting_consistency": "consistent" | "inconsistent" | "unable_to_determine",
    "edge_artifacts": "none_detected" | "minor" | "significant",
    "noise_patterns": "natural" | "artificial" | "mixed",
    "compression_anomalies": "none" | "present" | "significant",
    "facial_analysis": "natural" | "synthetic_indicators" | "not_applicable",
    "background_analysis": "coherent" | "anomalies_detected" | "not_applicable"
  },
  "recommendations": ["Array of 2-3 actionable recommendations for the user"],
  "reverse_image_note": "Note about whether this image appears to be widely circulated or unique"
}

Be thorough but balanced. Not every imperfection indicates manipulation - consider natural photography artifacts vs. deliberate alterations.`;

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
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image for signs of manipulation, AI generation, or deepfake characteristics. File name: ${fileName || "unknown"}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${fileType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
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
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to analyze media");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      analysisResult = {
        verdict: "inconclusive",
        confidence: 50,
        analysis_summary: "Unable to complete full analysis. The image may require manual review.",
        manipulation_indicators: [],
        authenticity_factors: [],
        technical_analysis: {
          lighting_consistency: "unable_to_determine",
          edge_artifacts: "none_detected",
          noise_patterns: "natural",
          compression_anomalies: "none",
          facial_analysis: "not_applicable",
          background_analysis: "coherent"
        },
        recommendations: ["Consider having this image reviewed by a professional forensic analyst"],
        reverse_image_note: "Unable to determine circulation status"
      };
    }

    // Store in verification history
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("verification_history").insert({
      verification_type: "media_authenticator",
      input_content: fileName || "uploaded_image",
      result_verdict: analysisResult.verdict,
      result_score: `${analysisResult.confidence}%`,
      result_details: analysisResult,
    });

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-media:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
