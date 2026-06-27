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
      type,
      clientPhone,
      professionalName,
      services,
      date,
      time,
      paymentMethod,
      total,
      customMessage,
      barbershopSlug,
    } = body;

    if (!clientPhone) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios faltando" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let zapiInstance = Deno.env.get("ZAPI_INSTANCE") || "";
    let zapiToken = Deno.env.get("ZAPI_TOKEN") || "";
    let zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN") || "";
    let barbershopPhone = Deno.env.get("BARBERSHOP_WHATSAPP") || "";
    let barbershopName = "";
    let barbershopAddress = "";

    // Try to load credentials from the database (per-barbershop)
    if (barbershopSlug) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: shop, error } = await supabase
            .from("barbershops")
            .select("zapi_instance, zapi_token, zapi_client_token, whatsapp, name, address")
            .eq("slug", barbershopSlug)
            .single();
          if (!error && shop) {
            if (shop.zapi_instance) zapiInstance = shop.zapi_instance;
            if (shop.zapi_token) zapiToken = shop.zapi_token;
            if (shop.zapi_client_token) zapiClientToken = shop.zapi_client_token;
            if (shop.whatsapp) barbershopPhone = shop.whatsapp;
            if (shop.name) barbershopName = shop.name;
            if (shop.address) barbershopAddress = shop.address;
          }
        }
      } catch (_e) {
        console.error("Erro ao buscar credenciais do banco:", _e);
      }
    }

    if (!barbershopName) barbershopName = "Barbearia";

    const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, "");
      return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    };

    const formatDateBr = (dateStr: string) => {
      if (!dateStr) return "";
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    };

    const formatCurrency = (val: number) => {
      if (val == null) return "R$ 0,00";
      return "R$ " + val.toFixed(2).replace(".", ",");
    };

    const servicesList = Array.isArray(services) ? services.join(", ") : services;

    let clientMessage = "";
    let barberMessage = "";

    if (type === "update") {
      clientMessage = customMessage ||
        `✂️ *${barbershopName} - Atualização*\n\n` +
        "Olá! Seu agendamento foi atualizado.\n\n" +
        "👤 *Profissional:* " + (professionalName || "") + "\n" +
        "📅 *Data:* " + formatDateBr(date) + "\n" +
        "⏰ *Horário:* " + (time || "") + "\n" +
        "✂️ *Serviços:* " + servicesList + "\n\n" +
        "Qualquer dúvida, entre em contato conosco.\n" +
        `📞 ${barbershopPhone ? "wa.me/" + formatPhone(barbershopPhone) : ""}`;
    } else if (type === "reminder_1h") {
      clientMessage =
        `⏰ *${barbershopName} - Lembrete*\n\n` +
        "Fala! Passando para lembrar que o seu horário está chegando.\n\n" +
        "👤 *Profissional:* " + professionalName + "\n" +
        "📅 *Data:* " + formatDateBr(date) + "\n" +
        "⏰ *Horário:* " + time + "\n" +
        "✂️ *Serviços:* " + servicesList + "\n\n" +
        "⚠️ *Falta apenas 1 hora!* Contamos com a sua presença.";
    } else {
      clientMessage =
        `✅ *${barbershopName} - Confirmação*\n\n` +
        "Olá! Seu agendamento foi confirmado com sucesso.\n\n" +
        "👤 *Profissional:* " + professionalName + "\n" +
        "📅 *Data:* " + formatDateBr(date) + "\n" +
        "⏰ *Horário:* " + time + "\n" +
        "✂️ *Serviços:* " + servicesList + "\n" +
        "💳 *Pagamento:* " + (paymentMethod || "Não informado") + "\n" +
        "💰 *Total:* " + formatCurrency(total) + "\n\n" +
        (barbershopAddress ? `📍 ${barbershopAddress}\n\n` : "") +
        "⏰ *Chegue com 10 minutos de antecedência!*\n\n" +
        `📞 ${barbershopPhone ? "wa.me/" + formatPhone(barbershopPhone) : ""}`;

      barberMessage =
        `✂️ *${barbershopName} - Novo Agendamento*\n\n` +
        "Um novo agendamento foi recebido!\n\n" +
        "👤 *Cliente:* " + (clientPhone || "Não informado") + "\n" +
        "👤 *Profissional:* " + professionalName + "\n" +
        "📅 *Data:* " + formatDateBr(date) + "\n" +
        "⏰ *Horário:* " + time + "\n" +
        "✂️ *Serviços:* " + servicesList + "\n" +
        "💳 *Pagamento:* " + (paymentMethod || "Não informado") + "\n" +
        "💰 *Total:* " + formatCurrency(total) + "\n\n" +
        "🔗 *Falar com cliente:* https://wa.me/" + formatPhone(clientPhone);
    }

    async function sendZapi(to: string, text: string) {
      if (!zapiInstance || !zapiToken) {
        return { error: "Z-API não configurada" };
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (zapiClientToken) {
        headers["Client-Token"] = zapiClientToken;
      }

      const res = await fetch(
        `https://api.z-api.io/instances/${zapiInstance}/token/${zapiToken}/send-text`,
        {
          method: "POST",
          headers,
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

    if (type === "update") {
      clientResult = await sendZapi(clientPhone, clientMessage);
    } else if (type === "reminder_1h") {
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
