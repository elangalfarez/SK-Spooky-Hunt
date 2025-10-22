// app/dashboard/page.tsx
// Created: Halloween-themed dashboard with world-class animations and spooky atmosphere

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import SegmentedProgressBar from "@/components/SegmentedProgressBar"
import { Camera, Lock, CheckCircle, TrendingUp, ChevronDown, ChevronUp, Ghost, Skull, Trophy, Sparkles, Flame, Target } from "lucide-react"
import { supabaseApi, Location, Player, PlayerProgress } from "@/lib/supabase"

interface PlayerData {
  name: string
  phone: string
  code: string
}

export default function HalloweenDashboardPage() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [progress, setProgress] = useState<PlayerProgress[]>([])
  const [showInstructions, setShowInstructions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    initializeDashboard()
  }, [router])

  useEffect(() => {
    if (player) {
      const interval = setInterval(async () => {
        try {
          const progressData = await supabaseApi.getPlayerProgress(player.id)
          setProgress(progressData)
        } catch (error) {
          console.error('Auto-refresh error:', error)
        }
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [player])

  const initializeDashboard = async () => {
    try {
      const playerId = localStorage.getItem("playerId")
      const playerName = localStorage.getItem("playerName") 
      const playerPhone = localStorage.getItem("playerPhone")
      
      if (!playerId || !playerName || !playerPhone) {
        router.push("/")
        return
      }
      
      setPlayerData({
        name: playerName,
        phone: playerPhone,
        code: "REGISTERED"
      })

      setLoading(true)

      const [playerDataFromDB, locationsData, progressData] = await Promise.all([
        supabaseApi.getPlayer(parseInt(playerId)),
        supabaseApi.getLocations(),
        supabaseApi.getPlayerProgress(parseInt(playerId))
      ])

      if (!playerDataFromDB) {
        localStorage.clear()
        router.push('/')
        return
      }

      setPlayer(playerDataFromDB)
      setLocations(locationsData)
      setProgress(progressData)

    } catch (error) {
      console.error('Dashboard initialization error:', error)
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const completedCount = progress.length
  const totalCount = locations.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getLocationStatus = (location: Location, index: number) => {
    const isCompleted = progress.some(p => p.location_id === location.id)
    const previousCompleted = index === 0 || progress.some(p => p.location_id === locations[index - 1]?.id)
    
    if (isCompleted) return 'completed'
    if (previousCompleted) return 'available'
    return 'locked'
  }

  const handleLocationClick = (location: Location) => {
    const status = getLocationStatus(location, locations.findIndex(l => l.id === location.id))
    
    if (status === 'locked') {
      return
    }
    
    if (status === 'completed') {
      return
    }

    router.push(`/scanner/${location.id}`)
  }

  const getLocationIcon = (location: Location, index: number) => {
    const status = getLocationStatus(location, index)
    
    if (status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-400 animate-bounce-subtle" />
    }
    if (status === 'available') {
      return <Camera className="w-6 h-6 text-orange-500 animate-pulse-glow" />
    }
    return <Lock className="w-6 h-6 text-gray-600" />
  }

  const getLocationCardClass = (location: Location, index: number) => {
    const status = getLocationStatus(location, index)
    
    if (status === 'completed') {
      return 'bg-gradient-to-br from-green-900/40 to-green-950/20 border-2 border-green-500/40 cursor-default backdrop-blur-md'
    }
    if (status === 'available') {
      return 'bg-gradient-to-br from-orange-900/40 to-red-950/20 border-2 border-orange-500/50 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30 backdrop-blur-md animate-glow-pulse'
    }
    return 'bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-gray-700/30 cursor-not-allowed opacity-60 backdrop-blur-md'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
            <Ghost className="w-10 h-10 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-text-muted animate-pulse">Memuat petualangan seram...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="max-w-md w-full backdrop-blur-xl bg-gradient-to-br from-red-900/40 to-gray-900/80 border-2 border-red-500/40">
          <CardContent className="p-6 text-center">
            <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
            <h3 className="font-semibold mb-2 text-red-400 text-xl">Terjadi Kesalahan</h3>
            <p className="text-sm mb-4 text-text-muted">{error}</p>
            <Button 
              onClick={initializeDashboard}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold"
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!playerData) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Halloween Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Pumpkins */}
        <div className="halloween-pumpkin pumpkin-1">🎃</div>
        <div className="halloween-pumpkin pumpkin-2">🎃</div>
        <div className="halloween-pumpkin pumpkin-3">🎃</div>
        
        {/* Floating Ghosts */}
        <div className="halloween-ghost ghost-1">👻</div>
        <div className="halloween-ghost ghost-2">👻</div>
        
        {/* Spooky Fog Effect */}
        <div className="fog fog-1"></div>
        <div className="fog fog-2"></div>
        <div className="fog fog-3"></div>
        
        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="halloween-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header with Spooky Glow */}
      <div className="relative z-10 bg-gradient-to-r from-purple-950/60 via-orange-950/60 to-purple-950/60 backdrop-blur-xl border-b-2 border-orange-500/30 p-6 shadow-2xl shadow-orange-500/20">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full animate-pulse-glow"></div>
              <Trophy className="w-12 h-12 text-orange-500 relative drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,146,60,0.5)] animate-text-glow">
            Halloween Spooky Hunt
          </h1>
          <p className="text-text-muted text-sm">
            Welcome, <span className="text-orange-400 font-semibold">{playerData.name}</span>
          </p>
          
          {/* Circular Progress */}
          <div className="relative w-24 h-24 mx-auto mt-4">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-gray-800"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
                className="text-orange-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{progressPercentage}%</div>
                <div className="text-xs text-text-muted">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-6">
        {/* Statistics Card with Glassmorphism */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-purple-950/40 to-gray-900/80 border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Progress Anda
              </h3>
              <span className="bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-orange-500/30 text-lg">
                {completedCount}/{totalCount}
              </span>
            </div>
            
            <SegmentedProgressBar 
              current={completedCount} 
              total={totalCount}
              className="mb-6"
            />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2 p-3 rounded-xl bg-green-900/20 border border-green-500/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:bg-green-900/30">
                <div className="text-3xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                  {completedCount}
                </div>
                <div className="text-xs text-green-300 font-medium flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Selesai
                </div>
              </div>
              
              <div className="space-y-2 p-3 rounded-xl bg-orange-900/20 border border-orange-500/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:bg-orange-900/30">
                <div className="text-3xl font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">
                  {locations.filter((l, i) => getLocationStatus(l, i) === "available").length}
                </div>
                <div className="text-xs text-orange-300 font-medium flex items-center justify-center gap-1">
                  <Target className="w-3 h-3" />
                  Tersedia
                </div>
              </div>
              
              <div className="space-y-2 p-3 rounded-xl bg-purple-900/20 border border-purple-500/30 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:bg-purple-900/30">
                <div className="text-3xl font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">
                  {progressPercentage}%
                </div>
                <div className="text-xs text-purple-300 font-medium flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Progres
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations Grid */}
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-4">
            Lokasi Treasure Hunt
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {locations.map((location, index) => {
              const status = getLocationStatus(location, index)
              
              return (
                <Card
                  key={location.id}
                  className={`transition-all duration-300 transform ${getLocationCardClass(location, index)}`}
                  onClick={() => handleLocationClick(location)}
                >
                  <CardContent className="p-5 relative">
                    {/* Status indicator glow */}
                    {status === 'available' && (
                      <div className="absolute top-2 right-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-orange-500 blur-md rounded-full animate-ping"></div>
                          <Flame className="w-4 h-4 text-orange-500 relative" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-full bg-gray-900/50 backdrop-blur-sm">
                        {getLocationIcon(location, index)}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                        location.floor === 'GF' 
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' 
                          : location.floor === 'UG'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {location.floor}
                      </span>
                    </div>

                    <h4 className="font-bold text-text-light text-base mb-2 line-clamp-1">
                      {location.name}
                    </h4>

                    <p className="text-xs text-text-muted/80 line-clamp-2 mb-3 italic">
                      Clue: {location.clue}
                    </p>

                    {status === 'available' && (
                      <div className="flex items-center justify-center text-xs font-semibold text-orange-400 pt-2 border-t border-orange-500/20 gap-1">
                        <span>Tap untuk mulai</span>
                        <span className="animate-bounce">→</span>
                      </div>
                    )}

                    {status === 'completed' && (
                      <div className="flex items-center justify-center text-xs font-semibold text-green-400 pt-2 border-t border-green-500/20 gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Selesai</span>
                      </div>
                    )}

                    {status === 'locked' && (
                      <div className="flex items-center justify-center text-xs font-semibold text-gray-500 pt-2 border-t border-gray-700/20 gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Terkunci</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="pb-6">
          <Button
            onClick={() => router.push('/progress')}
            className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold shadow-lg shadow-orange-500/30 transform transition-all duration-300 hover:scale-105"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Lihat Progress Detail
          </Button>
        </div>

        {/* How to Play Section */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-gray-900/60 to-purple-950/30 border-2 border-orange-500/20">
          <CardContent className="p-5">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Cara Bermain
              </h3>
              {showInstructions ? (
                <ChevronUp className="w-5 h-5 text-orange-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-orange-400" />
              )}
            </button>

            {showInstructions && (
              <div className="mt-4 space-y-3 text-sm text-text-light animate-fade-in">
                <div className="flex items-start gap-3 p-3 bg-orange-900/10 rounded-lg border border-orange-500/20">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    1
                  </div>
                  <p>Pilih lokasi yang tersedia (berwarna oranye)</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-900/10 rounded-lg border border-orange-500/20">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    2
                  </div>
                  <p>Scan QR code yang ada di lokasi tersebut</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-900/10 rounded-lg border border-orange-500/20">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    3
                  </div>
                  <p>Ambil foto selfie di lokasi tersebut</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-900/10 rounded-lg border border-orange-500/20">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    4
                  </div>
                  <p>Jawab pertanyaan quiz untuk membuka lokasi berikutnya</p>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-900/10 rounded-lg border border-green-500/20 mt-4">
                  <Trophy className="w-7 h-7 text-green-400 flex-shrink-0" />
                  <p className="text-green-300">
                    Selesaikan semua lokasi untuk mendapatkan hadiah voucher Rp 250.000
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center py-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <span>🎃</span>
            <span>Supermal Karawaci Halloween Event</span>
            <span>🎃</span>
          </div>
        </div>
      </div>
    </div>
  )
}