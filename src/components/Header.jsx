import { Globe, MessageCircle, Camera, Info, MapPin } from "lucide-react";

export default function Header({ onOpenInfo, onOpenPhotos, barbershop }) {
  const info = barbershop || {
    name: "MD BARBEARIA",
    address: "Rua Augusta, 1500 · Consolação, SP",
    instagram: "@md_barbearia",
    whatsapp: "5511999998888",
  };
  return (
    <header className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1585747861115-1c7f3c0b7a0a?w=1200&h=400&fit=crop)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-zinc-950/70 to-zinc-950/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center pt-8 pb-7 px-4">
        <div className="w-20 h-20 rounded-full bg-zinc-800/60 backdrop-blur-sm border-2 border-blue-600/50 flex items-center justify-center mb-4 shadow-glow-blue animate-float-slow">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 font-extrabold text-2xl tracking-tight">
            {barbershop ? barbershop.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "MD"}
          </span>
        </div>

        <h1 className="text-white text-xl font-bold tracking-[0.15em] uppercase">
          {info.name}
        </h1>

        <div className="flex items-center gap-1.5 mt-2 text-zinc-400 text-xs">
          <MapPin size={12} className="text-blue-500 shrink-0" />
          <span>{info.address}</span>
        </div>

        <div className="flex gap-2 mt-5 flex-wrap justify-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[11px] font-semibold px-3.5 py-2 rounded-full hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Globe size={13} className="group-hover:rotate-12 transition-transform relative z-10" />
            <span className="relative z-10">Instagram</span>
          </a>
          <a
            href={`https://wa.me/${info.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-semibold px-3.5 py-2 rounded-full hover:bg-green-500 hover:shadow-lg hover:shadow-green-600/30 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <MessageCircle size={13} className="group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">WhatsApp</span>
          </a>
          <button
            onClick={onOpenPhotos}
            className="group flex items-center gap-1.5 bg-zinc-700/60 hover:bg-zinc-600/80 text-zinc-200 text-[11px] font-semibold px-3.5 py-2 rounded-full border border-zinc-600/40 hover:border-zinc-500/60 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Camera size={13} className="group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Fotos</span>
          </button>
          <button
            onClick={onOpenInfo}
            className="group flex items-center gap-1.5 bg-zinc-700/60 hover:bg-zinc-600/80 text-zinc-200 text-[11px] font-semibold px-3.5 py-2 rounded-full border border-zinc-600/40 hover:border-zinc-500/60 transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Info size={13} className="group-hover:scale-110 transition-transform relative z-10" />
            <span className="relative z-10">Informações</span>
          </button>
        </div>
      </div>
    </header>
  );
}
