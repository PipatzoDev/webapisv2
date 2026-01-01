"use client"

import { useState, useEffect } from "react"
import { Terminal, Zap, Shield, Database, Globe, Github, Twitter, Mail, Users, Copy, Check, Clock, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ServerStatus {
  id: string
  name: string
  image: string
  ip: string
  online: boolean
  players: number
  maxPlayers: number
  playerList?: string[]
  motd?: string[]
  icon?: string
  uptime?: string
  version?: string
}

export default function CyberpunkHub() {
  const [glitchText, setGlitchText] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [copiedIP, setCopiedIP] = useState<string | null>(null)
  const { toast } = useToast()
  const [servers, setServers] = useState<ServerStatus[]>([
    {
      id: "minecraft-1",
      name: "Cargando...",
      image: "/minecraft-server-landscape.png",
      ip: "Cargnado...",
      online: true,
      players: 0,
      maxPlayers: 0,
      playerList: [],
    },
  ])
  useEffect(() => {
    setMounted(true)
    
    // Random glitch effect on title
    const glitchInterval = setInterval(() => {
      setGlitchText(true)
      setTimeout(() => setGlitchText(false), 200)
    }, 5000)

    const fetchServerStatus = async () => {
      try {
        // Agregar timestamp para evitar cache del navegador
        const response = await fetch(`/api/server-status?t=${Date.now()}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const data = await response.json()
          setServers(data.servers)
        }
      } catch (error) {
        console.log("[v0] Failed to fetch server status:", error)
      }
    }

    fetchServerStatus()
    const statusInterval = setInterval(fetchServerStatus, 30000)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(statusInterval)
    }
  }, [])

  const handleCopyIP = (ip: string, serverId: string) => {
    try {
      // Método alternativo que funciona sin HTTPS
      const textArea = document.createElement("textarea")
      textArea.value = "mc2.pipatzo.com"
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          setCopiedIP(serverId)
          toast({
            title: "IP copiada",
            description: `La IP mc2.pipatzo.com se ha copiado al portapapeles`,
            variant: "default",
          })
          setTimeout(() => setCopiedIP(null), 2000)
        } else {
          throw new Error('execCommand failed')
        }
      } catch (err) {
        // Fallback: intentar con clipboard API si está disponible
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText("mc2.pipatzo.com").then(() => {
            setCopiedIP(serverId)
            toast({
              title: "IP copiada",
              description: `La IP mc2.pipatzo.com se ha copiado al portapapeles`,
              variant: "default",
            })
            setTimeout(() => setCopiedIP(null), 2000)
          }).catch(() => {
            toast({
              title: "Error",
              description: "No se pudo copiar la IP",
              variant: "destructive",
            })
          })
        } else {
          throw err
        }
      } finally {
        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error("Error copying IP:", error)
      toast({
        title: "Error",
        description: "No se pudo copiar la IP. Intenta copiarla manualmente.",
        variant: "destructive",
      })
    }
  }

  const services = [
    { name: "Panel", icon: Terminal, href: "https://panel.pipatzo.com" },
    { name: "Archivos", icon: Database, href: "https://archivos.pipatzo.com" },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black text-red-500 overflow-hidden relative">
      <div className="fixed inset-0 grid-bg opacity-10" />

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16">
          <p className="text-lg text-red-400/70 tracking-widest">Estados Del Servidor</p>
          <br></br>
          <div className="h-px w-48 mx-auto bg-red-500 mb-4" />
        </header>

        <section className="max-w-3xl mx-auto mb-20">
          <div className="grid grid-cols-1 gap-6 mb-16">
            {servers.map((server) => (
              <div
                key={server.id}
                className="border border-red-500/30 bg-black/80 overflow-hidden hover:border-red-500 transition-all duration-300"
              >
                <div className="flex">
                  {/* Icono del servidor - Cuadrado a la izquierda */}
                  <div className="w-32 h-32 flex-shrink-0 border-r border-red-500/30 bg-black/90 p-3 flex items-center justify-center">
                    {server.icon ? (
                      <img
                        src={server.icon}
                        alt={server.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={"/minecraft-server-landscape.png"}
                        alt={server.name}
                        className="w-full h-full object-contain opacity-60"
                      />
                    )}
                  </div>

                  {/* Contenido principal */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-red-400">{server.name}</h3>
                      <div className="flex items-center gap-2 bg-black/80 px-3 py-1 border border-red-500/30">
                        <div
                          className={`w-2 h-2 rounded-full ${server.online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`}
                        />
                        <span className="text-xs text-red-400 font-mono">{server.online ? "Activo" : "Desconectado"}</span>
                      </div>
                    </div>
                    
                    {/* IP/Dominio - Resaltada */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-red-500/60 font-mono">IP/Dominio:</span>
                        <span 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyIP(server.ip, server.id)
                          }}
                          className="text-sm font-bold text-red-400 font-mono bg-red-500/10 border border-red-500/30 px-2 py-1 hover:bg-red-500/20 hover:border-red-500/50 transition-all cursor-pointer"
                        >
                          mc2.pipatzo.com
                        </span>
                        {copiedIP === server.id ? (
                          <Check className="w-4 h-4 text-red-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-red-500/40" />
                        )}
                      </div>
                      <div className="text-xs text-red-500/40 font-mono">
                        Click en la IP para copiar
                      </div>
                    </div>

                    {/* Versión y Uptime */}
                    <div className="flex items-center gap-4 mb-3 text-xs">
                      {server.version && (
                        <div className="flex items-center gap-1">
                          <span className="text-red-500/60 font-mono">Versión:</span>
                          <span className="text-red-400/80 font-mono">{server.version}</span>
                        </div>
                      )}
                      {server.uptime && (
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${server.online ? "text-green-500" : "text-red-500"}`} />
                          <span className="text-red-400/80 font-mono">{server.uptime}</span>
                        </div>
                      )}
                    </div>

                    {/* MOTD - Formato mejorado */}
                    {server.motd && server.motd.length > 0 && (
                      <div className="mb-3 pt-3 border-t border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-red-500/60" />
                          <span className="text-xs font-semibold text-red-500/80 font-mono uppercase tracking-wide">MOTD</span>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/10 p-3 space-y-1">
                          {server.motd.map((line, index) => (
                            <div key={index} className="text-sm text-red-300/90 font-mono leading-relaxed">
                              {line || '\u00A0'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conteo de Jugadores */}
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-500/60" />
                        <span className="text-red-400 font-mono">
                          {server.players}/{server.maxPlayers} Jugadores
                        </span>
                      </div>
                    </div>

                    {/* Lista de Jugadores */}
                    {server.online && (
                      <div className="mt-3 pt-3 border-t border-red-500/20">
                        {server.playerList && server.playerList.length > 0 ? (
                          <>
                            <div className="text-xs text-red-500/60 font-mono mb-2">
                              Jugadores Online ({server.playerList.length}):
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {server.playerList.map((player, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-red-400/80 font-mono px-2 py-1 bg-red-500/5 border border-red-500/10"
                                >
                                  • {player}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : server.players > 0 ? (
                          <div className="text-xs text-red-500/60 font-mono">
                            {server.players} jugador{server.players !== 1 ? 'es' : ''} online (lista no disponible)
                          </div>
                        ) : (
                          <div className="text-xs text-red-500/40 font-mono">No hay jugadores online</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {services.map((service) => (
              <a
                key={service.name}
                href={service.href}
                className="group border border-red-500/30 hover:border-red-500 bg-black/80 p-6 transition-all duration-300 hover:-translate-y-1"
              >
                <service.icon className="w-10 h-10 mb-3 text-red-500 group-hover:text-red-400 transition-colors" />
                <h3 className="text-lg font-bold text-red-400 group-hover:text-red-300 transition-colors">
                  {service.name}
                </h3>
              </a>
            ))}
          </div>
        </section>

        <footer className="text-center border-t border-red-500/20 pt-8">
          <div className="flex justify-center gap-6 mb-6">
            <a href="#github" className="text-red-500/60 hover:text-red-400 transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#twitter" className="text-red-500/60 hover:text-red-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#mail" className="text-red-500/60 hover:text-red-400 transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-xs text-red-500/40">© 2026  ^PipaTzO#</p>
        </footer>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
