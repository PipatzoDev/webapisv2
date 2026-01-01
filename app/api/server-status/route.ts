import { NextResponse } from "next/server"
import { SERVERS_CONFIG } from "@/lib/servers-config"

export async function GET() {
  try {
    // Consultar cada servidor usando la API de mcsrvstat.us
    const serverData = await Promise.all(
      SERVERS_CONFIG.map(async (serverConfig) => {
        try {
          const apiUrl = `https://api.mcsrvstat.us/3/${serverConfig.host}`
          console.log(`[v0] Fetching server status for ${serverConfig.host} from ${apiUrl}`)

          const response = await fetch(apiUrl, {
            headers: {
              "Content-Type": "application/json",
            },
            // Sin cache para actualización instantánea
            cache: 'no-store',
          })

          if (!response.ok) {
            console.error(`[v0] Failed to fetch status for ${serverConfig.host}:`, response.status, response.statusText)
            return {
              id: serverConfig.id,
              name: serverConfig.name,
              image: serverConfig.image,
              ip: `${serverConfig.host}:25565`,
              online: false,
              players: 0,
              maxPlayers: 0,
              playerList: [],
              motd: [],
              icon: null,
              version: null,
              uptime: undefined,
            }
          }

          const data = await response.json()
          console.log(`[v0] Server ${serverConfig.host} data:`, JSON.stringify(data, null, 2))

          // Extraer información del servidor
          const online = data.online || false
          const players = data.players?.online || 0
          const maxPlayers = data.players?.max || 0
          
          // Extraer lista de jugadores
          // En mcsrvstat.us, la lista está en data.players.list y cada jugador tiene {name, uuid}
          let playerList: string[] = []
          if (data.players?.list && Array.isArray(data.players.list)) {
            playerList = data.players.list.map((player: any) => {
              // Si es un objeto con 'name', usar name, si no, usar el string directamente
              return typeof player === 'string' ? player : player.name || player
            })
          }

          // Extraer MOTD (Message of the Day)
          const motd = data.motd?.clean || data.motd?.raw || []

          // Extraer icono del servidor
          const icon = data.icon || null

          // Extraer versión
          const version = data.version || null

          // Calcular uptime (tiempo que lleva online)
          // La API no proporciona uptime directamente, pero podemos usar el tiempo desde que está online
          // Por ahora, si está online, mostraremos "Online" o calcular basado en cache
          let uptime: string | undefined = undefined
          if (online) {
            // Si hay información de uptime en los datos, usarla
            // Si no, simplemente indicar que está online
            uptime = "Online"
          }

          // Construir IP/Dominio
          const ip = data.hostname 
            ? `${data.hostname}:${data.port || 25565}`
            : data.ip 
            ? `${data.ip}:${data.port || 25565}`
            : `${serverConfig.host}:25565`

          console.log(`[v0] Server ${serverConfig.host} - Online: ${online}, Players: ${players}/${maxPlayers}, List: ${playerList.length} players`)

          return {
            id: serverConfig.id,
            name: serverConfig.name,
            image: serverConfig.image,
            ip: ip,
            online: online,
            players: players,
            maxPlayers: maxPlayers,
            playerList: playerList,
            motd: Array.isArray(motd) ? motd : [motd].filter(Boolean),
            icon: icon,
            version: version,
            uptime: uptime,
          }
        } catch (error) {
          console.error(`[v0] Error fetching server ${serverConfig.host}:`, error)
          return {
            id: serverConfig.id,
            name: serverConfig.name,
            image: serverConfig.image,
            ip: `${serverConfig.host}:25565`,
            online: false,
            players: 0,
            maxPlayers: 0,
            playerList: [],
          }
        }
      }),
    )

    // Retornar solo el primer servidor
    return NextResponse.json({ servers: serverData.slice(0, 1) })
  } catch (error) {
    console.error("[v0] Error in server status API:", error)
    // Retornar datos por defecto en caso de error
    return NextResponse.json({
      servers: SERVERS_CONFIG.map((config) => ({
        id: config.id,
        name: config.name,
        image: config.image,
        ip: `${config.host}:25565`,
        online: false,
        players: 0,
        maxPlayers: 0,
        playerList: [],
      })),
    })
  }
}
