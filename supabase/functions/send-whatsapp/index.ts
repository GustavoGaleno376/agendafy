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
      type, // 'immediate' ou 'reminder_1h'
      clientPhone,
      professionalName,
      services,
      date,
      time,
      paymentMethod,
      total,
    } = body;

    if (!clientPhone || !professionalName || !date || !time) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios faltando" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Configurações da Z-API pegando das variáveis de ambiente do Supabase
    const zapiInstance = Deno.env.get("ZAPI_INSTANCE");
    const zapiToken = Deno.env.get("ZAPI_TOKEN");
    const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");
    const barbershopPhone = Deno.env.get("BARBERSHOP_WHATSAPP");

    const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, "");
      return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    };

    const formatDateBr = (dateStr: string) => {
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    };

    const servicesList = Array.isArray(services) ? services.join(", ") : services;

    let clientMessage = "";
    let barberMessage = "";

    if (type === "reminder_1h") {
      clientMessage =
        "⏰ *MD BARBEARIA - Lembrete de Agendamento*\n\n" +
        "Fala! Passando para lembrar que o seu horário está chegando.\n\n" +
        "👤 Profissional: " + professionalName + "\n" +
        "📅 Data: " + formatDateBr(date) + "\n" +
        "⏰ *Horário: " + time + "*\n" +
        "✂️ Serviços: " + servicesList + "\n\n" +
        "📍 Local: Rua Augusta, 1500 - Consolação, SP\n" +
        "⚠️ *Falta apenas 1 hora!* Contamos com a sua presença.";
    } else {
      clientMessage =
        "🔴 *MD BARBEARIA - Confirmação*\n\n" +
        "✅ *Agendamento Confirmado!*\n\n" +
        "👤 Profissional: " + professionalName + "\n" +
        "📅 Data: " + formatDateBr(date) + "\n" +
        "⏰ Horário: " + time + "\n" +
        "📍 Local: Rua Augusta, 1500 - Consolação, SP\n" +
        "✂️ Serviços: " + servicesList + "\n" +
        "💳 Pagamento: " + (paymentMethod || "Não informado") + "\n" +
        "💰 Total: R$ " + (total ? total.toFixed(2).replace(".", ",") : "0,00") + "\n\n" +
        "⚠️ *Não se atrase!* Chegue com 10 minutos de antecedência.";

      barberMessage =
        "👤 *MD BARBEARIA - Novo Agendamento*\n\n" +
        "✅ *Agendamento recebido!*\n\n" +
        "👤 *Cliente:* " + clientPhone + "\n" +
        "👤 *Profissional:* " + professionalName + "\n" +
        "📅 *Data:* " + formatDateBr(date) + "\n" +
        "⏰ *Horário:* " + time + "\n" +
        "✂️ *Serviços:* " + servicesList + "\n\n" +
        "🔗 *Falar com cliente:* https://wa.me/" + formatPhone(clientPhone);
    }

    // Função interna para disparar requisição HTTP para a Z-API
    async function sendZapi(to: string, text: string) {
      if (!zapiInstance || !zapiToken) {
  console.error("Variáveis da Z-API não configuradas nas Edge Functions");
  return { error: "Z-API não configurada" };
}

      const res = await fetch(
        `https://api.z-api.io/instances/${zapiInstance}/token/${zapiToken}/send-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Client-Token": zapiClientToken,
          },
          body: JSON.stringify({
            phone: formatPhone(to),
            message: text,
          }),
        }
      );
      return res.json();
    }

    let clientResult = null;
    let barberResult = null;

    if (type === "reminder_1h") {
      clientResult = await sendZapi(clientPhone, clientMessage);
    } else {
      clientResult = await sendZapi(clientPhone, clientMessage);
      if (barbershopPhone) {
        barberResult = await sendZapi(barbershopPhone, barberMessage);
      }
    }

    return new Response(
      JSON.stringify({ success: true, zapi: { client: clientResult, barber: barberResult } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Erro interno:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});