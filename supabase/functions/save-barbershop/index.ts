import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      slug,
      name,
      phone,
      whatsapp,
      address,
      instagram,
      hours,
      photos,
      zapiInstance,
      zapiToken,
      zapiClientToken,
    } = body;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "slug é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
      .from("barbershops")
      .upsert({
        slug,
        name: name || slug,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address: address || null,
        instagram: instagram || null,
        hours: hours || null,
        photos: photos || null,
        zapi_instance: zapiInstance || null,
        zapi_token: zapiToken || null,
        zapi_client_token: zapiClientToken || null,
      }, { onConflict: "slug" });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
