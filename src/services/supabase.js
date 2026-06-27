import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createAppointment({
  clientName,
  clientPhone,
  professionalName,
  services,
  date,
  time,
  paymentMethod,
  total,
  totalDuration,
  barbershopSlug,
}) {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      client_name: clientName,
      client_phone: clientPhone,
      professional_name: professionalName,
      services: services,
      date: date,
      time: time,
      payment_method: paymentMethod,
      total: total,
      total_duration: totalDuration || null,
      status: "Agendado",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Erro ao salvar agendamento");
  }

  let whatsappResult = null;
  try {
    const res = await supabase.functions.invoke("send-whatsapp", {
      body: { 
        type: "immediate", 
        clientPhone, 
        professionalName, 
        services, 
        date, 
        time, 
        paymentMethod, 
        total,
        barbershopSlug,
      },
    });
    whatsappResult = { success: true, data: res };
  } catch (err) {
    whatsappResult = { success: false, error: err.message };
  }

  return { appointment: data, whatsapp: whatsappResult };
}

export async function getAppointments() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Erro ao buscar agendamentos");
  }

  return data || [];
}

export async function updateAppointment(id, updates) {
  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Erro ao atualizar agendamento");
  }

  if (!data) {
    throw new Error("Agendamento não encontrado");
  }

  return data;
}

export async function getProfessionals(slug) {
  try {
    const { data, error } = await supabase.functions.invoke("get-professionals", {
      body: { slug },
    });
    if (!error && data) return data;
  } catch {}
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!shop) return [];
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .eq("barbershop_id", shop.id)
      .eq("active", true);
    if (!error) return data || [];
  } catch {}
  return [];
}

export async function saveProfessionals(barbershopSlug, professionals) {
  try {
    const { error } = await supabase.functions.invoke("save-professionals", {
      body: { barbershopSlug, professionals },
    });
    if (!error) return;
  } catch {}
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", barbershopSlug)
      .maybeSingle();
    if (!shop) throw new Error("Barbearia não encontrada");
    const { error: delError } = await supabase
      .from("professionals")
      .delete()
      .eq("barbershop_id", shop.id);
    if (delError) throw delError;
    if (professionals.length > 0) {
      const { error: insError } = await supabase
        .from("professionals")
        .insert(professionals.map(p => ({
          barbershop_id: shop.id,
          name: p.name,
          title: p.title || "Barbeiro",
          avatar: p.avatar || null,
          active: true,
        })));
      if (insError) throw insError;
    }
  } catch (err) {
    console.error("Erro ao salvar profissionais (fallback):", err);
  }
}

export async function toggleDayOff(barbershopSlug, date, unavailable, professionalName) {
  const { error } = await supabase.functions.invoke("toggle-day-off", {
    body: { barbershopSlug, date, unavailable, professionalName },
  });
  if (error) throw new Error(error.message || "Erro ao alterar disponibilidade");
}

export async function getUnavailableDays(barbershopSlug, professionalName) {
  const { data: shop } = await supabase
    .from("barbershops")
    .select("id")
    .eq("slug", barbershopSlug)
    .maybeSingle();

  if (!shop) return [];

  let query = supabase
    .from("barber_unavailable_days")
    .select("date")
    .eq("barbershop_id", shop.id);

  if (professionalName) {
    query = query.eq("professional_name", professionalName);
  } else {
    query = query.is("professional_name", null);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message || "Erro ao buscar dias indisponíveis");
  return (data || []).map((r) => r.date);
}

export async function getOccupiedTimes(date) {
  const { data, error } = await supabase
    .from("appointments")
    .select("time")
    .eq("date", date);

  if (error) throw new Error(error.message || "Erro ao buscar horários ocupados");
  return (data || []).map((r) => r.time);
}

export async function getServicesByBarbershop(slug) {
  const { data: shop } = await supabase
    .from("barbershops")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!shop) return [];

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("barbershop_id", shop.id)
    .eq("active", true)
    .order("name");

  if (error) throw new Error(error.message || "Erro ao buscar serviços");
  return data || [];
}

export async function saveService(barbershopId, service) {
  if (service.id) {
    const { data, error } = await supabase
      .from("services")
      .update({ name: service.name, duration: service.duration, price: service.price })
      .eq("id", service.id)
      .select()
      .single();
    if (error) throw new Error(error.message || "Erro ao salvar serviço");
    return data;
  } else {
    const { data, error } = await supabase
      .from("services")
      .insert({ barbershop_id: barbershopId, name: service.name, duration: service.duration, price: service.price, active: true })
      .select()
      .single();
    if (error) throw new Error(error.message || "Erro ao criar serviço");
    return data;
  }
}

export async function deleteService(serviceId) {
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);
  if (error) throw new Error(error.message || "Erro ao deletar serviço");
}

export async function getOccupiedTimesByProfessional(date, professionalName) {
  const { data, error } = await supabase
    .from("appointments")
    .select("time, services, total, total_duration")
    .eq("date", date)
    .eq("professional_name", professionalName)
    .not("status", "eq", "Cancelado");

  if (error) throw new Error(error.message || "Erro ao buscar horários ocupados");
  return data || [];
}

export async function getProfessionalUnavailableDays(slug, professionalName) {
  const { data: shop } = await supabase
    .from("barbershops")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!shop) return [];

  const { data, error } = await supabase
    .from("barber_unavailable_days")
    .select("date")
    .eq("barbershop_id", shop.id)
    .eq("professional_name", professionalName);

  if (error) throw new Error(error.message || "Erro ao buscar dias indisponíveis");
  return (data || []).map((r) => r.date);
}

export async function toggleProfessionalDayOff(slug, professionalName, date, unavailable) {
  try {
    const { error } = await supabase.functions.invoke("toggle-day-off", {
      body: { barbershopSlug: slug, date, unavailable, professionalName },
    });
    if (!error) return;
  } catch {}
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!shop) return;
    if (unavailable) {
      await supabase.from("barber_unavailable_days").insert({
        barbershop_id: shop.id,
        professional_name: professionalName,
        date,
      });
    } else {
      await supabase.from("barber_unavailable_days").delete()
        .eq("barbershop_id", shop.id)
        .eq("professional_name", professionalName)
        .eq("date", date);
    }
  } catch (err) {
    console.error("Erro ao alterar disponibilidade (fallback):", err);
  }
}

export async function getBarbershops() {
  try {
    const { data, error } = await supabase.functions.invoke("get-barbershops");
    if (!error && data) return data;
  } catch {}
  try {
    const { data, error } = await supabase
      .from("barbershops")
      .select("id, slug, name, phone, whatsapp, address, instagram, hours, photos")
      .order("name");
    if (!error) return data || [];
  } catch {}
  return [];
}

export async function getBarbershopIdBySlug(slug) {
  const { data, error } = await supabase
    .from("barbershops")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message || "Erro ao buscar barbearia");
  return data?.id || null;
}

export async function getBarbershopBySlug(slug) {
  const { data, error } = await supabase
    .from("barbershops")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message || "Erro ao buscar barbearia");
  return data || null;
}

export async function getProfessionalSchedule(slug, professionalName) {
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!shop) return null;
    const { data, error } = await supabase
      .from("professionals")
      .select("work_days, work_start, work_end")
      .eq("barbershop_id", shop.id)
      .eq("name", professionalName)
      .maybeSingle();
    if (!error && data) return data;
  } catch {}
  return null;
}

export async function saveProfessionalSchedule(slug, professionalName, schedule) {
  const { work_days, work_start, work_end } = schedule;
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!shop) return;
    await supabase
      .from("professionals")
      .update({ work_days, work_start, work_end })
      .eq("barbershop_id", shop.id)
      .eq("name", professionalName);
  } catch (err) {
    console.error("Erro ao salvar horários:", err);
  }
}

export async function getProfessionalTimeOff(slug, professionalName) {
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!shop) return [];
    const { data, error } = await supabase
      .from("professional_time_off")
      .select("*")
      .eq("barbershop_id", shop.id)
      .eq("professional_name", professionalName)
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date");
    if (!error) return data || [];
  } catch {}
  return [];
}

export async function saveProfessionalTimeOff(slug, professionalName, date, startTime, endTime, reason) {
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!shop) return;
    await supabase.from("professional_time_off").insert({
      barbershop_id: shop.id,
      professional_name: professionalName,
      date,
      start_time: startTime,
      end_time: endTime,
      reason: reason || "",
    });
  } catch (err) {
    console.error("Erro ao salvar folga:", err);
  }
}

export async function deleteProfessionalTimeOff(id) {
  try {
    await supabase.from("professional_time_off").delete().eq("id", id);
  } catch (err) {
    console.error("Erro ao deletar folga:", err);
  }
}

export async function saveProfessionalAvatar(barbershopSlug, professionalName, avatar) {
  try {
    const { data, error } = await supabase.functions.invoke("save-professional-avatar", {
      body: { barbershopSlug, professionalName, avatar },
    });
    if (!error && data) return data;
  } catch {}
  try {
    const { data: shop } = await supabase
      .from("barbershops")
      .select("id")
      .eq("slug", barbershopSlug)
      .maybeSingle();
    if (shop) {
      const { error } = await supabase
        .from("professionals")
        .update({ avatar })
        .eq("barbershop_id", shop.id)
        .eq("name", professionalName);
      if (!error) return { success: true };
    }
  } catch (err) {
    console.error("Erro ao salvar avatar (fallback):", err);
  }
  return null;
}
