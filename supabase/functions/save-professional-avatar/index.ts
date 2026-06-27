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
    const { barbershopSlug, professionalName, avatar } = body;

    if (!barbershopSlug || !professionalName) {
      return new Response(
        JSON.stringify({ error: "barbershopSlug e professionalName são obrigatórios" }),
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

    const { data: existingPro, error: findError } = await supabase
      .from("professionals")
      .select("*")
      .eq("barbershop_id", shop.id)
      .eq("name", professionalName)
      .maybeSingle();

    if (findError) throw findError;

    let professional;
    if (existingPro) {
      const { data: updatedPro, error: updateError } = await supabase
        .from("professionals")
        .update({ avatar })
        .eq("id", existingPro.id)
        .select()
        .single();

      if (updateError) throw updateError;
      professional = updatedPro;
    } else {
      const { data: newPro, error: insertError } = await supabase
        .from("professionals")
        .insert({
          barbershop_id: shop.id,
          name: professionalName,
          title: "Barbeiro",
          avatar: avatar || null,
          active: true,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      professional = newPro;
    }

    return new Response(
      JSON.stringify({ success: true, professional }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});