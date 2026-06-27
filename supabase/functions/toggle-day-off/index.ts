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
    const { barbershopSlug, date, unavailable, professionalName } = body;

    if (!barbershopSlug || !date) {
      return new Response(
        JSON.stringify({ error: "barbershopSlug e date são obrigatórios" }),
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

    if (unavailable === false) {
      let deleteQuery = supabase
        .from("barber_unavailable_days")
        .delete()
        .eq("barbershop_id", shop.id)
        .eq("date", date);

      if (professionalName) {
        deleteQuery = deleteQuery.eq("professional_name", professionalName);
      } else {
        deleteQuery = deleteQuery.is("professional_name", null);
      }

      const { error } = await deleteQuery;
      if (error) throw error;
    } else {
      const record: Record<string, any> = { barbershop_id: shop.id, date };
      if (professionalName) {
        record.professional_name = professionalName;
      }

      const { error } = await supabase
        .from("barber_unavailable_days")
        .upsert(record, { onConflict: "barbershop_id, date, professional_name" });

      if (error) throw error;
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
