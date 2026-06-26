import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createAppointment({
  clientPhone,
  professionalName,
  services,
  date,
  time,
  paymentMethod,
  total,
}) {
  // Salvar no banco diretamente
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

  // Tentar enviar WhatsApp via Edge Function (opcional)
  supabase.functions.invoke("send-whatsapp", {
    body: { clientPhone, professionalName, services, date, time, paymentMethod, total },
  }).catch(() => {
    console.log("WhatsApp não configurado ainda");
  });

  return data;
}

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
