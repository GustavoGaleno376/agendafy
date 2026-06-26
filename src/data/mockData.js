export const MIRANDA = { id: "p1", name: "Miranda", title: "Barbeiro Master", avatar: null };
export const CARLOS = { id: "p2", name: "Carlos", title: "Barbeiro Senior", avatar: null };

export const professionals = [MIRANDA, CARLOS];

export const services = [
  { id: "s1", name: "Barba", duration: 30, price: 20 },
  { id: "s2", name: "Bigode", duration: 5, price: 5 },
  { id: "s3", name: "Corte", duration: 30, price: 25 },
  { id: "s4", name: "Corte + Barba", duration: 60, price: 45 },
  { id: "s5", name: "Sobrancelha", duration: 15, price: 10 },
  { id: "s6", name: "Luzes", duration: 120, price: 60 },
];

export const paymentMethods = [
  { id: "dinheiro", name: "Dinheiro", icon: "Banknote" },
  { id: "pix", name: "PIX", icon: "QrCode" },
  { id: "credito", name: "Crédito", icon: "CreditCard" },
  { id: "debito", name: "Débito", icon: "Landmark" },
];

export const businessHours = { weekdays: "08:00 às 23:00", sunday: "Fechado" };

export const barbershopInfo = {
  id: "b1",
  name: "MD BARBEARIA",
  slug: "md-barbearia",
  address: "Rua Augusta, 1500 - Consolação, São Paulo - SP, 01304-001",
  phone: "(11) 99999-8888",
  whatsapp: "5511999998888",
  instagram: "@md_barbearia",
  hours: "Seg a Sáb: 08:00 às 23:00 | Dom: Fechado",
  verified: true,
  photos: [
    "https://images.unsplash.com/photo-1599351431202-1e0f0134c02b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665665?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1567894340315-735d7c361db7?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1593702288056-70b0f9e44f91?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1596728325384-3e5a1e9c3c3b?w=400&h=400&fit=crop",
  ],
};

export const barbershops = [
  barbershopInfo,
  {
    id: "b2",
    name: "Barber Classic",
    slug: "barber-classic",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    phone: "(11) 98888-7777",
    whatsapp: "5511988887777",
    instagram: "@barberclassic",
    hours: "Seg a Sáb: 09:00 às 21:00",
    verified: true,
    photos: [
      "https://images.unsplash.com/photo-1596728325488-58c87691e9af?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1567894340315-735d7c361db7?w=400&h=400&fit=crop",
    ],
  },
  {
    id: "b3",
    name: "Cortes & Cia",
    slug: "cortes-cia",
    address: "Rua Oscar Freire, 500 - Jardins, São Paulo - SP",
    phone: "(11) 97777-6666",
    whatsapp: "5511977776666",
    instagram: "@cortesecia",
    hours: "Seg a Sáb: 08:00 às 22:00",
    verified: false,
    photos: [
      "https://images.unsplash.com/photo-1585747861115-1c7f3c0b7a0a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0134c02b?w=400&h=400&fit=crop",
    ],
  },
];

export const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  slots.push("22:00");
  return slots;
};

export const occupiedSlots = {
  "2026-06-26": ["09:00", "10:30", "14:00", "15:30", "18:00"],
  "2026-06-27": ["08:30", "11:00", "13:00", "16:30", "19:00"],
  "2026-06-28": ["10:00", "12:00", "15:00", "17:30", "20:00"],
};

export const initialAppointment = {
  id: 1,
  barbershopId: "b1",
  services: ["Sobrancelha", "Corte"],
  professional: MIRANDA,
  date: "2026-06-15",
  time: "14:00",
  paymentMethod: "PIX",
  total: 40,
  status: "Concluído",
  rating: null,
};
