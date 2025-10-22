// app/scanner/[locationId]/page.tsx
// Updated: World-class Halloween design with spooky atmosphere

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Camera, 
  FlashlightIcon as Flashlight,
  ArrowLeft, 
  AlertCircle,
  CheckCircle,
  X,
  RotateCcw,
  Type,
  Check,
  QrCode
} from "lucide-react"
import QrScanner from "qr-scanner"
import { supabaseApi, Location } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

const LOCATION_NAMES: Record<string, string> = {
  main_lobby: "Main Lobby",
  south_lobby: "South Lobby", 
  u_walk: "U Walk",
  east_dome: "East Dome"
}

export default function QRScannerPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  
  const [location, setLocation] = useState<Location | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  
  const locationId = params.locationId as string
  const locationName = LOCATION_NAMES[locationId] || locationId

  useEffect(() => {
    const playerId = localStorage.getItem('playerId')
    if (!playerId) {
      router.push('/')
      return
    }
    loadLocationData()
    requestCameraAccess()
  }, [locationId, router])

  useEffect(() => {
    return () => {
      cleanupScanner()
    }
  }, [])

  useEffect(() => {
    console.log('useEffect triggered:', { 
      isScanning, 
      cameraPermission, 
      videoElementExists: !!videoRef.current 
    })
    
    if (isScanning && cameraPermission === "granted" && videoRef.current) {
      console.log('Video element is now available, initializing scanner...')
      setIsInitializing(true)
      initializeQrScanner()
    }
  }, [isScanning, cameraPermission])

  const loadLocationData = async () => {
    try {
      const locations = await supabaseApi.getLocations()
      const currentLocation = locations.find(loc => loc.id === locationId)
      
      if (!currentLocation) {
        setError('Lokasi tidak ditemukan')
        return
      }
      
      setLocation(currentLocation)
    } catch (error) {
      setError('Gagal memuat data lokasi')
    }
  }

  const cleanupScanner = () => {
    if (qrScannerRef.current) {
      try {
        qrScannerRef.current.destroy()
      } catch (error) {
        console.error('Error destroying scanner:', error)
      }
      qrScannerRef.current = null
    }
    setFlashOn(false)
    setIsInitializing(false)
  }

  const initializeQrScanner = async (retryCount = 0) => {
    if (!videoRef.current) {
      console.error('Video element not available')
      
      if (retryCount < 3) {
        console.log(`Retrying in ${(retryCount + 1) * 200}ms... (attempt ${retryCount + 1}/3)`)
        setTimeout(() => {
          initializeQrScanner(retryCount + 1)
        }, (retryCount + 1) * 200)
      } else {
        setError('Tidak dapat mengakses kamera. Silakan refresh halaman atau gunakan input manual.')
        setIsInitializing(false)
      }
      return
    }
    
    try {
      cleanupScanner()
      
      console.log('Initializing QR Scanner...')
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleQRDetected(result.data),
        {
          preferredCamera: 'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
        }
      )
      
      await qrScannerRef.current.start()
      setCameraPermission("granted")
      setIsInitializing(false)
      console.log('QR Scanner started successfully')
      
    } catch (error) {
      console.error('QR Scanner initialization error:', error)
      cleanupScanner()
      setCameraPermission("denied")
      setIsInitializing(false)
      setError("Kamera tidak tersedia. Gunakan input manual untuk memasukkan kode QR")
    }
  }

  const requestCameraAccess = async () => {
    try {
      console.log('Requesting camera access...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('Camera access granted')
      stream.getTracks().forEach(track => track.stop())
      setCameraPermission("granted")
      
    } catch (error) {
      console.error('Camera access error:', error)
      setCameraPermission("denied")
      setError("Kamera tidak tersedia. Gunakan input manual untuk memasukkan kode QR")
    }
  }

  const toggleFlash = async () => {
    const scanner = qrScannerRef.current;
    if (!scanner || typeof scanner.hasFlash !== "function") return;

    try {
      const has = await scanner.hasFlash();
      if (!has) return;

      await scanner.toggleFlash();
      setFlashOn(prev => !prev);
    } catch (err) {
      console.error("toggleFlash error:", err);
    }
  }

  const stopScanning = () => {
    console.log('Stopping scanner...')
    cleanupScanner()
    setIsScanning(false)
    setIsInitializing(false)
  }

  const startScanning = async () => {
    console.log('Starting scanner...')
    setIsScanning(true)
    setError('')
  }

  const handleQRDetected = (code: string) => {
    console.log('QR Code detected:', code)
    console.log('Current location:', locationId)
    
    setIsScanning(false)
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
    }
    
    const locationQRCodes = {
      'main_lobby': ['SPOOKYHUNT_MAIN_LOBBY_2025', 'SERAM_MAIN_LOBBY'],
      'south_lobby': ['SPOOKYHUNT_SOUTH_LOBBY_2025', 'SERAM_SOUTH_LOBBY'],
      'east_dome': ['SPOOKYHUNT_EAST_DOME_2025', 'SERAM_EAST_DOME'],
      'u_walk': ['SPOOKYHUNT_U_WALK_2025', 'SERAM_U_WALK']
    }
    
    const validCodesForLocation = locationQRCodes[locationId as keyof typeof locationQRCodes] || []
    
    const isValidForLocation = validCodesForLocation.some(validCode => 
      code.toUpperCase().includes(validCode.toUpperCase())
    )
    
    if (isValidForLocation) {
      setSuccess('QR Code berhasil discan! 🎉')
      
      toast({
        title: "QR Code berhasil discan!",
        description: "Melanjutkan ke tahap foto selfie",
      })
      
      setTimeout(() => {
        router.push(`/photo/${locationId}`)
      }, 1500)
    } else {
      const allValidCodes = Object.values(locationQRCodes).flat()
      const isValidQRButWrongLocation = allValidCodes.some(validCode => 
        code.toUpperCase().includes(validCode.toUpperCase())
      )
      
      if (isValidQRButWrongLocation) {
        setError('QR Code ini untuk lokasi lain! Pastikan Anda berada di lokasi yang benar.')
      } else {
        setError('QR Code tidak valid untuk treasure hunt ini.')
      }
      
      toast({
        title: "QR Code Tidak Valid",
        description: error,
        variant: "destructive"
      })
      
      setTimeout(() => {
        setError('')
        setIsScanning(true)
      }, 3000)
    }
  }

  const handleManualSubmit = () => {
    if (manualCode.length < 6) return
    handleQRDetected(manualCode)
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Memuat lokasi...</p>
        </div>
      </div>
    )
  }

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
            onClick={() => router.push('/dashboard')}
            className="text-white hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              📱 Scan QR Code
            </h1>
            <p className="text-gray-400 text-sm">{locationName}</p>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4">
        {/* Location Info Card */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <QrCode className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{locationName}</h3>
                <p className="text-sm text-gray-400">
                  Scan QR code di lokasi ini
                </p>
              </div>
            </div>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              Langkah 1 dari 3
            </Badge>
          </CardContent>
        </Card>

        {/* Success Message */}
        {success && (
          <Alert className="bg-green-500/10 border-green-500/30 backdrop-blur-md animate-fade-in">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <AlertDescription className="text-green-400 font-medium">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-md animate-shake">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Camera Scanner */}
        {cameraPermission === "granted" && isScanning && (
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 overflow-hidden backdrop-blur-md">
            <CardContent className="p-0">
              {/* Camera Viewfinder */}
              <div className="relative h-80 bg-black overflow-hidden">
                {/* Video element */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                
                {/* Loading overlay */}
                {isInitializing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-white text-sm">Memulai kamera...</p>
                    </div>
                  </div>
                )}
                
                {/* QR Detection Frame */}
                {!isInitializing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-48 h-48">
                      {/* Corner borders with glow */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg shadow-lg shadow-orange-500/50"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-lg shadow-lg shadow-orange-500/50"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-lg shadow-lg shadow-orange-500/50"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-lg shadow-lg shadow-orange-500/50"></div>
                      
                      {/* Scanning line */}
                      <div className="absolute inset-x-4 top-1/2 h-1 bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
                    </div>
                  </div>
                )}

                {/* Instructions overlay */}
                {!isInitializing && (
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white text-sm bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm">
                      🎃 Arahkan ke QR code {locationName}
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="p-4 border-t border-orange-500/20 bg-gray-900/40 backdrop-blur-sm">
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFlash}
                    className="bg-gray-900/50 border-orange-500/30 text-white hover:bg-orange-500/20 transition-all"
                    disabled={isInitializing}
                  >
                    <Flashlight className={`h-5 w-5 ${flashOn ? 'text-orange-400' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={stopScanning}
                    className="bg-gray-900/50 border-orange-500/30 text-white hover:bg-orange-500/20 transition-all"
                    disabled={isInitializing}
                  >
                    <Type className="h-5 w-5 mr-2" />
                    Input Manual
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Input */}
        {(!isScanning || cameraPermission === "denied") && (
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-orange-500/20 rounded-full mb-4">
                  <Type className="h-12 w-12 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  Input Manual
                </h3>
                <p className="text-sm text-gray-400">
                  Masukkan kode QR secara manual jika kamera tidak tersedia
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Masukkan kode QR"
                    className="text-center text-lg font-mono tracking-wider bg-gray-900/50 border-orange-500/30 text-white placeholder:text-gray-500 focus:border-orange-500"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  {cameraPermission === "granted" && (
                    <Button
                      variant="outline"
                      onClick={startScanning}
                      className="flex-1 border-orange-500/30 text-white hover:bg-orange-500/10 transition-all"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Kembali ke Kamera
                    </Button>
                  )}
                  <Button
                    onClick={handleManualSubmit}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all"
                    disabled={manualCode.length < 6}
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Verifikasi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Camera Permission Denied */}
        {cameraPermission === "denied" && (
          <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Akses Kamera Ditolak
              </h3>
              <p className="text-gray-400 mb-4">
                Untuk menggunakan scanner QR, izinkan akses kamera pada pengaturan browser
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={requestCameraAccess}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-500/10 border-blue-500/20 backdrop-blur-md">
          <CardContent className="p-4">
            <h4 className="text-blue-300 font-semibold text-sm mb-2">📋 Petunjuk Scan QR:</h4>
            <ol className="text-gray-400 text-xs space-y-1 ml-4 list-decimal">
              <li>Cari QR code khusus untuk {locationName}</li>
              <li>Arahkan kamera ke QR code hingga terdeteksi</li>
              <li>Pastikan pencahayaan cukup untuk scan yang optimal</li>
              <li>QR code harus sesuai dengan lokasi yang sedang Anda kunjungi</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}