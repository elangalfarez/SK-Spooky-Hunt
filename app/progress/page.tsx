// app/progress/page.tsx
// Updated: World-class Halloween design with fixed connection lines and mobile responsive

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Camera, 
  MapPin, 
  Calendar, 
  Award, 
  Share2, 
  Star,
  CheckCircle,
  Lock,
  ArrowLeft,
  Target,
  Gift,
  Clock,
  Zap,
  Flame
} from "lucide-react"
import { supabaseApi, Location, Player, PlayerProgress } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export default function ProgressPage() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [progress, setProgress] = useState<PlayerProgress[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      const playerId = localStorage.getItem('playerId')
      if (!playerId) {
        router.push('/')
        return
      }

      setLoading(true)

      const [playerData, locationsData, progressData] = await Promise.all([
        supabaseApi.getPlayer(parseInt(playerId)),
        supabaseApi.getLocations(),
        supabaseApi.getPlayerProgress(parseInt(playerId))
      ])

      if (!playerData) {
        localStorage.clear()
        router.push('/')
        return
      }

      setPlayer(playerData)
      setLocations(locationsData)
      setProgress(progressData)

      generateAchievements(progressData, locationsData)

    } catch (error) {
      console.error('Progress loading error:', error)
      setError('Gagal memuat data progress')
    } finally {
      setLoading(false)
    }
  }

  const generateAchievements = (progressData: PlayerProgress[], locationsData: Location[]) => {
    const completedCount = progressData.length
    const totalLocations = locationsData.length

    const achievementsList: Achievement[] = [
      {
        id: "first_step",
        title: "Langkah Pertama",
        description: "Selesaikan lokasi pertama",
        icon: "🎯",
        unlocked: completedCount >= 1,
        unlockedAt: completedCount >= 1 ? progressData[0]?.completed_at : undefined,
      },
      {
        id: "halfway_hero",
        title: "Pahlawan Setengah Jalan",
        description: "Selesaikan setengah dari semua lokasi",
        icon: "⭐",
        unlocked: completedCount >= Math.ceil(totalLocations / 2),
        unlockedAt: completedCount >= Math.ceil(totalLocations / 2) ? progressData[Math.ceil(totalLocations / 2) - 1]?.completed_at : undefined,
      },
      {
        id: "photo_master",
        title: "Master Fotografi",
        description: "Ambil foto di semua lokasi",
        icon: "📸",
        unlocked: completedCount >= totalLocations,
        unlockedAt: completedCount >= totalLocations ? progressData[totalLocations - 1]?.completed_at : undefined,
      },
      {
        id: "halloween_champion",
        title: "Juara Halloween",
        description: "Selesaikan semua tantangan",
        icon: "🏆",
        unlocked: completedCount >= totalLocations,
        unlockedAt: completedCount >= totalLocations ? progressData[totalLocations - 1]?.completed_at : undefined,
      },
    ]

    setAchievements(achievementsList)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateOverallProgress = () => {
    if (locations.length === 0) return 0
    return Math.round((progress.length / locations.length) * 100)
  }

  const getLocationStatus = (locationId: string) => {
    return progress.some(p => p.location_id === locationId) ? 'completed' : 'pending'
  }

  const shareProgress = async () => {
    const progressPercent = calculateOverallProgress()
    const text = `🏆 Saya telah menyelesaikan ${progressPercent}% Spooky Hunt Supermal Karawaci! ${progress.length}/${locations.length} lokasi selesai. Ikut main juga yuk! #SpookyHuntSupermalKarawaci`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Progress Spooky Hunt Supermal Karawaci",
          text: text,
          url: window.location.origin,
        })
        
        toast({
          title: "Berhasil dibagikan! 🎉",
          description: "Progress Anda telah dibagikan",
        })
      } catch (error) {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Disalin ke clipboard",
          description: "Silakan paste di media sosial Anda",
        })
      }
    } else {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Disalin ke clipboard",
        description: "Silakan paste di media sosial Anda",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Memuat progress...</p>
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] flex items-center justify-center p-4">
        <Card className="bg-red-500/10 border-red-500/30 max-w-md backdrop-blur-md">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2 text-red-400">Terjadi Kesalahan</h3>
            <p className="text-sm mb-4 text-gray-400">{error || 'Data tidak ditemukan'}</p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
            >
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercent = calculateOverallProgress()
  const completedCount = progress.length
  const totalLocations = locations.length
  const unlockedAchievements = achievements.filter(a => a.unlocked)

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
        {Array.from({ length: 20 }).map((_, i) => (
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
        
        {/* Spider Webs */}
        <div className="spider-web top-left"></div>
        <div className="spider-web top-right"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-[#1a0f1f] via-[#2a1a1f] to-[#1a0f1f] border-b border-orange-500/20 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard")}
            className="text-white hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Progress Anda
            </h1>
            <p className="text-gray-400 text-sm">Supermal Karawaci</p>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-semibold">{player.name}</p>
            <p className="text-gray-400 text-xs">{completedCount}/{totalLocations} selesai</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4">
        {/* Main Progress Card */}
        <Card className="bg-gradient-to-br from-orange-900/40 to-red-950/20 border-2 border-orange-500/30 backdrop-blur-md overflow-hidden">
          <CardContent className="p-6">
            {/* Circular Progress Indicator */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="rgba(251, 146, 60, 0.2)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 58}`}
                    strokeDashoffset={`${2 * Math.PI * 58 * (1 - progressPercent / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Trophy className="w-10 h-10 text-orange-400 mb-1" />
                  <span className="text-2xl font-bold text-white">{progressPercent}%</span>
                </div>
                
                {/* Completion badge */}
                {completedCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg shadow-green-500/50 animate-bounce-subtle">
                    {completedCount}
                  </div>
                )}
              </div>

              {/* Status Message */}
              <div className="text-center mb-4">
                {progressPercent === 100 ? (
                  <>
                    <h2 className="text-2xl font-bold text-orange-400 mb-2">🎉 Selamat!</h2>
                    <p className="text-white">Anda telah menyelesaikan semua tantangan!</p>
                    <p className="text-gray-400 text-sm mt-1">Klaim hadiah Anda di customer service</p>
                  </>
                ) : progressPercent === 0 ? (
                  <>
                    <h2 className="text-2xl font-bold text-orange-400 mb-2">Mulai Petualangan!</h2>
                    <p className="text-white">{totalLocations} lokasi menanti Anda</p>
                    <p className="text-gray-400 text-sm mt-1">Scan QR code di setiap lokasi untuk memulai</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-orange-400 mb-2">Terus Semangat!</h2>
                    <p className="text-white">{completedCount} dari {totalLocations} lokasi selesai</p>
                    <p className="text-gray-400 text-sm mt-1">Anda sudah {progressPercent}% menuju hadiah!</p>
                  </>
                )}
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-900/40 to-green-950/20 border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">{progressPercent}%</div>
                  <div className="text-xs text-green-300">Selesai</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-yellow-900/40 to-yellow-950/20 border border-yellow-500/30">
                  <div className="text-2xl font-bold text-yellow-400">{completedCount * 100}</div>
                  <div className="text-xs text-yellow-300">Poin</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-900/40 to-purple-950/20 border border-purple-500/30">
                  <div className="text-2xl font-bold text-purple-400">{unlockedAchievements.length}</div>
                  <div className="text-xs text-purple-300">Prestasi</div>
                </div>
              </div>

              {/* Share Button */}
              <Button 
                onClick={shareProgress} 
                className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-lg shadow-orange-500/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Perjalanan Anda - VERTICAL TIMELINE */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 backdrop-blur-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-400" />
              Perjalanan Anda
            </h3>

            {locations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada lokasi tersedia</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-red-500 to-purple-500"></div>

                {/* Location Cards */}
                <div className="space-y-6">
                  {locations.map((location, index) => {
                    const isCompleted = getLocationStatus(location.id) === 'completed'
                    const completedProgress = progress.find(p => p.location_id === location.id)

                    return (
                      <div key={location.id} className="relative pl-16">
                        {/* Timeline Node */}
                        <div className={`absolute left-3 top-4 w-6 h-6 rounded-full border-4 ${
                          isCompleted 
                            ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' 
                            : 'bg-gray-700 border-gray-600'
                        } flex items-center justify-center z-10`}>
                          {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>

                        {/* Location Card */}
                        <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30'
                            : 'bg-gray-900/40 border-gray-700/30 hover:border-orange-500/40'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-white">{location.name}</h4>
                                <Badge className={`text-xs ${
                                  isCompleted
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                }`}>
                                  {location.floor}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                {location.clue}
                              </p>

                              {isCompleted && completedProgress && (
                                <div className="flex items-center text-xs text-green-400 gap-4">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(completedProgress.completed_at)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Camera className="w-3 h-3" />
                                    Foto ✓
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="w-3 h-3" />
                                    Quiz ✓
                                  </span>
                                </div>
                              )}

                              {!isCompleted && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Belum dikunjungi
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {completedCount === 0 && (
              <div className="text-center mt-6">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Mulai Petualangan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 backdrop-blur-md">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-orange-400" />
              Prestasi ({unlockedAchievements.length}/{achievements.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    achievement.unlocked 
                      ? "bg-gradient-to-br from-orange-900/40 to-yellow-950/20 border-orange-500/30 shadow-lg shadow-orange-500/20" 
                      : "bg-gray-900/40 border-gray-700/30 opacity-60"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm ${
                        achievement.unlocked ? "text-orange-400" : "text-gray-500"
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                      {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-xs text-orange-300 mt-1">
                          <Zap className="w-3 h-3 inline mr-1" />
                          {formatDate(achievement.unlockedAt)}
                        </p>
                      )}
                    </div>
                    {achievement.unlocked && <Star className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prize Info */}
        {progressPercent === 100 ? (
          <Card className="bg-gradient-to-r from-green-900/40 to-emerald-950/20 border-2 border-green-500/30 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <Gift className="w-16 h-16 text-green-400 mx-auto mb-3 animate-bounce-subtle" />
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                🎉 Selamat! Anda Berhak Mendapat Hadiah!
              </h3>
              <p className="text-gray-300 mb-4">
                Kunjungi customer service untuk mengklaim hadiah Anda!
              </p>
              <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30">
                💰 Rp 250k Voucher
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-blue-500/10 border-blue-500/20 backdrop-blur-md">
            <CardContent className="p-4 text-center">
              <Target className="w-10 h-10 text-blue-400 mx-auto mb-2" />
              <h4 className="text-blue-300 font-semibold text-sm mb-1">
                Informasi Hadiah
              </h4>
              <p className="text-gray-400 text-xs">
                Selesaikan semua {totalLocations} lokasi untuk mendapat kesempatan memenangkan Rp 250k cash voucher! 
                Hadiah terbatas untuk 40 orang pertama.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}