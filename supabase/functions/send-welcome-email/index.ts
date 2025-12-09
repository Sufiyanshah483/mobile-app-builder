import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  displayName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, displayName }: WelcomeEmailRequest = await req.json();
    const name = displayName || "there";

    console.log("Sending welcome email to:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Qurify <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to Qurify - Your Digital Guardian!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden;">
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%); border-radius: 20px; margin: 0 auto 24px;">
                  </div>
                  <h1 style="color: #f8fafc; font-size: 28px; margin: 0 0 8px;">Welcome to Qurify!</h1>
                  <p style="color: #94a3b8; font-size: 16px; margin: 0;">Your digital guardian is ready to help</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 12px; padding: 24px;">
                    <p style="color: #f8fafc; font-size: 18px; margin: 0 0 16px;">Hey ${name}! 👋</p>
                    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                      We're thrilled to have you join the Qurify community! You've taken an important step toward building your digital resilience and staying protected from misinformation.
                    </p>
                    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
                      Here's what you can do with Qurify:
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background: rgba(20, 184, 166, 0.1); border: 1px solid rgba(20, 184, 166, 0.2); border-radius: 12px; padding: 16px;">
                        <span style="color: #14b8a6; font-weight: 600;">🔗 Trust Score</span>
                        <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0;">Verify news sources instantly</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 12px; padding: 16px;">
                        <span style="color: #0ea5e9; font-weight: 600;">🖼️ Media Authenticator</span>
                        <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0;">Detect deepfakes and manipulated media</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 16px;">
                        <span style="color: #a855f7; font-weight: 600;">🎮 Inoculation Games</span>
                        <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0;">Learn to spot misinformation through fun challenges</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; text-align: center; border-top: 1px solid rgba(148, 163, 184, 0.1);">
                  <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">
                    Need help? Contact us at
                    <a href="mailto:sufiyanshah4545@gmail.com" style="color: #14b8a6; text-decoration: none;">sufiyanshah4545@gmail.com</a>
                  </p>
                  <p style="color: #475569; font-size: 11px; margin: 0;">
                    © 2024 Qurify. Stay Informed, Stay Protected.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      }),
    });

    const data = await res.json();
    console.log("Welcome email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
