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
    const { barbershopSlug, professionals } = body;

    if (!barbershopSlug || !professionals || !Array.isArray(professionals)) {
      return new Response(
        JSON.stringify({ error: "barbershopSlug e professionals array são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", barbershopSlug)
      .maybeSingle();

    if (!shop) {
      return new Response(
        JSON.stringify({ error: "Barbearia não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: delError } = await supabase
      .from("professionals")
      .delete()
      .eq("barbershop_id", shop.id);

    if (delError) throw delError;

    const rows = professionals.map((p: any) => ({
      barbershop_id: shop.id,
      name: p.name,
      title: p.title || "Barbeiro",
      avatar: p.avatar || null,
      active: true,
    }));

    if (rows.length > 0) {
      const { error: insError } = await supabase.from("professionals").insert(rows);
      if (insError) throw insError;
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
