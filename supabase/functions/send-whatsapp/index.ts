import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      clientPhone,
      professionalName,
      services,
      date,
      time,
      paymentMethod,
      total,
    } = await req.json();

    if (!clientPhone || !professionalName || !date || !time) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios faltando" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Salvar no banco
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const { data: appointment, error: dbError } = await supabase
      .from("appointments")
      .insert({
        client_phone: clientPhone,
        professional_name: professionalName,
        services: services,
        date: date,
        time: time,
        payment_method: paymentMethod,
        total: total,
        status: "Agendado",
      })
      .select()
      .single();

    if (dbError) {
      return new Response(
        JSON.stringify({ error: "Erro ao salvar agendamento" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Config Evolution API
    const evolutionUrl = Deno.env.get("EVOLUTION_API_URL");
    const evolutionKey = Deno.env.get("EVOLUTION_API_KEY");
    const evolutionInstance = Deno.env.get("EVOLUTION_INSTANCE");
    const barbershopPhone = Deno.env.get("BARBERSHOP_WHATSAPP");

    const formatPhone = (phone) => {
      const cleaned = phone.replace(/\D/g, "");
      return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    };

    const formatDateBr = (dateStr) => {
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    };

    const servicesList = services.join(", ");

    // Mensagem para o CLIENTE
    const clientMessage =
      "🔴 *MD BARBEARIA - Confirmação*\n\n" +
      "✅ *Agendamento Confirmado!*\n\n" +
      "👤 Profissional: " + professionalName + "\n" +
      "📅 Data: " + formatDateBr(date) + "\n" +
      "⏰ Horário: " + time + "\n" +
      "📍 Local: Rua Augusta, 1500 - Consolação, SP\n" +
      "✂️ Serviços: " + servicesList + "\n" +
      "💳 Pagamento: " + paymentMethod + "\n" +
      "💰 Total: R$ " + total.toFixed(2).replace(".", ",") + "\n\n" +
      "⚠️ *Não se atrase!* Chegue com 10 minutos de antecedência.\n\n" +
      "Se precisar alterar algo, é só me chamar!";

    // Mensagem para o BARBEIRO
    const barberMessage =
      "👤 *MD BARBEARIA - Novo Agendamento*\n\n" +
      "✅ *Agendamento recebido!*\n\n" +
      "👤 *Cliente:* " + clientPhone + "\n" +
      "👤 *Profissional:* " + professionalName + "\n" +
      "📅 *Data:* " + formatDateBr(date) + "\n" +
      "⏰ *Horário:* " + time + "\n" +
      "✂️ *Serviços:* " + servicesList + "\n" +
      "💳 *Pagamento:* " + paymentMethod + "\n" +
      "💰 *Total:* R$ " + total.toFixed(2).replace(".", ",") + "\n\n" +
      "⚠️ *Lembrete:* O cliente foi orientado a chegar 10 min antes.\n\n" +
      "🔗 *Falar com cliente:* https://wa.me/" + formatPhone(clientPhone);

    // Enviar via Evolution API
    async function sendEvolution(to, text) {
      const res = await fetch(
        evolutionUrl + "/message/sendText/" + evolutionInstance,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: evolutionKey,
          },
          body: JSON.stringify({
            number: formatPhone(to),
            options: { delay: 1000, presence: "composing" },
            textMessage: { text },
          }),
        }
      );
      return res.json();
    }

    const [clientResult, barberResult] = await Promise.all([
      sendEvolution(clientPhone, clientMessage),
      sendEvolution(barbershopPhone, barberMessage),
    ]);

    return new Response(
      JSON.stringify({ success: true, appointment, evolution: { client: clientResult, barber: barberResult } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
