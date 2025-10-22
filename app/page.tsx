// app/page.tsx
// Created: Halloween-themed registration page with world-class animations and spooky decorations

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, Copy, ArrowRight, AlertCircle, Phone, RefreshCw, Trophy, User, Hash, Ghost, Skull } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { supabaseApi, Player } from "@/lib/supabase"

interface RegistrationData {
  code: string
  name: string
  phone: string
}

export default function HalloweenRegistrationPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState<RegistrationData>({
    code: "",
    name: "",
    phone: "",
  })
  
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryPhone, setRecoveryPhone] = useState("")
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    const playerId = localStorage.getItem('playerId')
    if (playerId) {
      router.push('/dashboard')
    }
  }, [router])

  const handleCodeChange = (value: string) => {
    const formatted = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6)
    setData((prev) => ({ ...prev, code: formatted }))
    setError("")
  }

  const handlePhoneChange = (value: string) => {
    let formatted = value.replace(/[^0-9]/g, "")
    if (formatted.startsWith("0")) {
      formatted = formatted.slice(0, 13)
    }
    setData((prev) => ({ ...prev, phone: formatted }))
    setError("")
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        return data.code.length === 6
      case 2:
        return data.name.trim().length >= 2 && data.phone.length >= 10 && data.phone.startsWith("08")
      case 3:
        return true
      default:
        return false
    }
  }

  const handleNext = async () => {
    if (!validateStep()) return
    
    setLoading(true)
    setError("")

    try {
      if (step === 1) {
        const result = await supabaseApi.validateSignupCode(data.code)
        
        if (!result.valid) {
          setError(result.message || "Kode tidak valid")
          setLoading(false)
          return
        }
        
        setStep(2)
      } else if (step === 2) {
        setStep(3)
      } else if (step === 3) {
        const result = await supabaseApi.registerPlayer(
          data.code,
          data.name.trim(),
          data.phone
        )

        if (!result.success || !result.player) {
          setError(result.message || "Gagal mendaftar")
          setLoading(false)
          return
        }

        localStorage.setItem("playerId", result.player.id.toString())
        localStorage.setItem("playerName", result.player.name)
        localStorage.setItem("playerPhone", result.player.phone)

        toast({
          title: "Pendaftaran Berhasil",
          description: "Selamat datang di Treasure Hunt",
        })

        router.push("/dashboard")
        return
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    }

    setLoading(false)
  }

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1))
    setError("")
  }

  const handleRecovery = async () => {
    if (!recoveryPhone || recoveryPhone.length < 10) {
      toast({
        title: "Error",
        description: "Masukkan nomor WhatsApp yang valid",
        variant: "destructive",
      })
      return
    }

    setRecoveryLoading(true)

    try {
      const { data: player, error } = await supabaseApi.supabase
        .from('players')
        .select('*')
        .eq('phone', recoveryPhone)
        .single()

      if (error || !player) {
        toast({
          title: "Tidak Ditemukan",
          description: "Nomor tidak terdaftar",
          variant: "destructive",
        })
        setRecoveryLoading(false)
        return
      }

      localStorage.setItem("playerId", player.id.toString())
      localStorage.setItem("playerName", player.name)
      localStorage.setItem("playerPhone", player.phone)

      toast({
        title: "Progress Ditemukan",
        description: `Selamat datang kembali, ${player.name}`,
      })

      router.push("/dashboard")
    } catch (err) {
      console.error("Recovery error:", err)
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      })
    }

    setRecoveryLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] relative overflow-hidden">
      {/* Animated Halloween Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Pumpkins */}
        <div className="halloween-pumpkin pumpkin-1">
          🎃
        </div>
        <div className="halloween-pumpkin pumpkin-2">
          🎃
        </div>
        <div className="halloween-pumpkin pumpkin-3">
          🎃
        </div>
        
        {/* Floating Ghosts */}
        <div className="halloween-ghost ghost-1">
          👻
        </div>
        <div className="halloween-ghost ghost-2">
          👻
        </div>
        
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
        
        {/* Spider Webs in corners */}
        <div className="spider-web top-left"></div>
        <div className="spider-web top-right"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Spooky Trophy Icon with Glow */}
        <div className="mb-6 relative group">
          <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full animate-pulse-glow"></div>
          <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-600 p-5 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-6">
            <Trophy className="w-10 h-10 text-black drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Main Title with Spooky Effect */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 relative">
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,146,60,0.5)] animate-text-glow">
            Supermal Karawaci
          </span>
        </h1>

        {/* Subtitle with Halloween Twist */}
        <div className="text-center mb-2 relative">
          <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">
            🎃 Spooky Hunt 🎃
          </p>
        </div>
        
        <p className="text-text-muted text-center mb-8 max-w-md text-sm md:text-base">
          Bergabunglah dalam petualangan seru penuh misteri dan hadiah mengerikan
        </p>

        {/* Step Indicators with Halloween Icons */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
            step >= 1 
              ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/50 scale-110' 
              : 'bg-gray-700/50 backdrop-blur-sm'
          }`}>
            <Hash className={`w-5 h-5 ${step >= 1 ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <div className={`h-1 w-12 rounded-full transition-all duration-500 ${
            step >= 2 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-700/50'
          }`}></div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
            step >= 2 
              ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/50 scale-110' 
              : 'bg-gray-700/50 backdrop-blur-sm'
          }`}>
            <User className={`w-5 h-5 ${step >= 2 ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <div className={`h-1 w-12 rounded-full transition-all duration-500 ${
            step >= 3 ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-700/50'
          }`}></div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 ${
            step >= 3 
              ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/50 scale-110' 
              : 'bg-gray-700/50 backdrop-blur-sm'
          }`}>
            <Ghost className={`w-5 h-5 ${step >= 3 ? 'text-white' : 'text-gray-400'}`} />
          </div>
        </div>

        {/* Main Card with Glassmorphism and Depth */}
        <Card className="w-full max-w-md backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-purple-950/40 to-gray-900/80 border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20 transform transition-all duration-300 hover:shadow-orange-500/40 hover:border-orange-500/50 relative overflow-hidden group">
          {/* Animated border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-border-glow"></div>
          
          {/* Spooky corner decorations */}
          <div className="absolute top-0 left-0 w-16 h-16 opacity-20">
            <Skull className="w-full h-full text-orange-500 -rotate-12" />
          </div>
          <div className="absolute bottom-0 right-0 w-16 h-16 opacity-20">
            <Skull className="w-full h-full text-orange-500 rotate-12" />
          </div>
          
          <CardContent className="p-6 md:p-8 relative z-10">
            {/* Step Content */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Kode Treasure Hunt
                  </h2>
                  <p className="text-sm text-text-muted">
                    Kode Treasure Hunt
                  </p>
                  <p className="text-xs text-text-muted/70">
                    Dapatkan kode dari petugas di lokasi
                  </p>
                </div>

                <div className="space-y-2">
                  <Input
                    type="text"
                    value={data.code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="Masukkan 6 karakter kode"
                    maxLength={6}
                    disabled={loading}
                    className="h-14 text-center text-lg tracking-[0.5em] font-bold uppercase bg-gray-900/50 border-2 border-orange-500/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 text-white placeholder:text-gray-500 placeholder:tracking-normal transition-all duration-300 hover:border-orange-500/50"
                  />
                  <p className="text-xs text-center text-text-muted">
                    {data.code.length}/6 karakter
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Informasi Peserta
                  </h2>
                  <p className="text-sm text-text-muted">
                    Lengkapi data diri Anda
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-light flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-500" />
                      Nama Lengkap
                    </label>
                    <Input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama lengkap"
                      disabled={loading}
                      className="h-12 bg-gray-900/50 border-2 border-orange-500/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 text-white placeholder:text-gray-500 transition-all duration-300 hover:border-orange-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-light flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" />
                      Nomor WhatsApp
                    </label>
                    <Input
                      type="tel"
                      value={data.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      disabled={loading}
                      className="h-12 bg-gray-900/50 border-2 border-orange-500/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 text-white placeholder:text-gray-500 transition-all duration-300 hover:border-orange-500/50"
                    />
                    <p className="text-xs text-text-muted">
                      Gunakan nomor aktif untuk notifikasi
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-full animate-bounce-subtle">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Konfirmasi Data
                  </h2>
                  <p className="text-sm text-text-muted">
                    Pastikan data Anda sudah benar
                  </p>
                </div>

                <div className="space-y-4 bg-gray-900/30 backdrop-blur-sm p-5 rounded-xl border border-orange-500/20">
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                    <span className="text-sm text-text-muted">Kode:</span>
                    <span className="text-base font-bold text-orange-400 tracking-wider">{data.code}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
                    <span className="text-sm text-text-muted">Nama:</span>
                    <span className="text-base font-medium text-text-light">{data.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-text-muted">WhatsApp:</span>
                    <span className="text-base font-medium text-text-light">{data.phone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message with Spooky Icon */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-950/50 backdrop-blur-sm border-2 border-red-500/50 rounded-lg animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <Button
                onClick={handleNext}
                disabled={!validateStep() || loading}
                className="w-full h-14 bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 hover:from-orange-700 hover:via-orange-600 hover:to-red-700 text-white font-bold text-base shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-orange-500/50 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {step === 1 ? "Memvalidasi..." : step === 3 ? "Mendaftarkan..." : "Memproses..."}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>
                      {step === 1 ? "Lanjut" : step === 2 ? "Lanjut" : "Daftar Sekarang"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

              {step > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  disabled={loading}
                  className="w-full h-12 border-2 border-orange-500/40 bg-transparent text-text-light hover:bg-orange-500/10 hover:border-orange-500/60 transition-all duration-300"
                >
                  Kembali
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recovery Dialog with Halloween Theme */}
        <div className="mt-8 text-center">
          <Dialog open={showRecovery} onOpenChange={setShowRecovery}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-text-muted hover:text-orange-400 text-sm hover:bg-orange-500/10 transition-all duration-300 group"
              >
                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Sudah pernah daftar? Lanjutkan Progress
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-gray-900 via-purple-950/50 to-gray-900 border-2 border-orange-500/30 text-text-light max-w-md backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Phone className="w-6 h-6 text-orange-500" />
                  Lanjutkan Progress
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <p className="text-text-muted text-sm">
                  Masukkan nomor WhatsApp yang Anda gunakan saat mendaftar untuk melanjutkan progress permainan
                </p>

                <Input
                  type="tel"
                  value={recoveryPhone}
                  onChange={(e) => setRecoveryPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 13))}
                  placeholder="08xxxxxxxxxx"
                  disabled={recoveryLoading}
                  className="h-12 bg-gray-900/50 border-2 border-orange-500/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 text-white placeholder:text-gray-500"
                />

                <Button
                  onClick={handleRecovery}
                  disabled={recoveryLoading || recoveryPhone.length < 10}
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold shadow-lg shadow-orange-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/50"
                >
                  {recoveryLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mencari...</span>
                    </div>
                  ) : (
                    "Lanjutkan Progress"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Event Info with Pumpkin */}
        <div className="mt-8 text-center text-xs text-text-muted flex items-center gap-2 backdrop-blur-sm bg-gray-900/30 px-4 py-2 rounded-full border border-orange-500/20">
          <span>🎃</span>
          <span>Supermal Karawaci × 🎃 Week of the Living Deals Halloween</span>
          <span>🎃</span>
        </div>
      </div>
    </div>
  )
}