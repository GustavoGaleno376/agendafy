import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Salva o agendamento no banco de dados e dispara 
 * a mensagem de confirmação imediata via WhatsApp.
 */
export async function createAppointment({
  clientPhone,
  professionalName,
  services,
  date,
  time,
  paymentMethod,
  total,
}) {
  // 1. Salvar no banco de dados do Supabase
  const { data, error } = await supabase
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

  if (error) {
    throw new Error(error.message || "Erro ao salvar agendamento");
  }

  // 2. Disparar a Edge Function para enviar o WhatsApp de CONFIRMAÇÃO
  // Enviamos o 'type: "immediate"' para ativar a primeira condicional da sua Function
  supabase.functions
    .invoke("send-whatsapp", {
      body: { 
        type: "immediate", 
        clientPhone, 
        professionalName, 
        services, 
        date, 
        time, 
        paymentMethod, 
        total 
      },
    })
    .then((res) => {
      console.log("Edge Function executada com sucesso:", res);
    })
    .catch((err) => {
      console.error("Erro ao chamar Edge Function do WhatsApp:", err);
    });

  // Retorna os dados do agendamento que foram salvos no banco
  return data;
}

/**
 * Busca todos os agendamentos salvos no banco, 
 * ordenados do mais recente para o mais antigo.
 */
export async function getAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Erro ao buscar agendamentos");
  }

  return data;
}