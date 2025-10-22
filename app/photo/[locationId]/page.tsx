// app/photo/[locationId]/page.tsx
// Updated: World-class Halloween design with spooky atmosphere

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Camera, 
  ArrowLeft, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  SwitchCamera,
  X
} from "lucide-react"
import { supabaseApi, Location } from "@/lib/supabase"

export default function PhotoCapturePage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [location, setLocation] = useState<Location | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false)
  
  useEffect(() => {
    console.log('📹 Stream state changed:', !!stream, stream ? 'ACTIVE' : 'NULL')
  }, [stream])
  
  const locationId = params.locationId as string

  useEffect(() => {
    const playerId = localStorage.getItem('playerId')
    if (!playerId) {
      router.push('/')
      return
    }

    loadLocationData()
    checkAndRequestCameraPermission()
    
    setTimeout(() => {
      if (cameraPermission === 'pending' && !stream) {
        console.log('Forcing camera initialization attempt...')
        setCameraPermission('granted')
      }
    }, 1000)
    
  }, [locationId, router])

  useEffect(() => {
    console.log('Photo capture useEffect triggered:', { 
      cameraPermission, 
      videoElementExists: !!videoRef.current,
      hasStream: !!stream,
      capturedPhoto: !!capturedPhoto,
      isInitializing,
      isSwitchingCamera
    })
    
    if (cameraPermission === 'granted' && !stream && !capturedPhoto && videoRef.current && !isInitializing && !isSwitchingCamera) {
      console.log('Conditions met, initializing camera...')
      initializeCamera()
    }
  }, [cameraPermission, stream, capturedPhoto, isInitializing, isSwitchingCamera])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

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

  const checkAndRequestCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      
      if (result.state === 'granted') {
        setCameraPermission('granted')
      } else if (result.state === 'denied') {
        setCameraPermission('denied')
      } else {
        requestCameraPermission()
      }
    } catch (error) {
      console.log('Permission API not supported, requesting directly')
      requestCameraPermission()
    }
  }

  const initializeCamera = async () => {
    if (isInitializing || isSwitchingCamera) {
      console.log('Already initializing or switching, skipping...')
      return
    }
    
    setIsInitializing(true)
    setError('')
    
    try {
      console.log(`📷 Initializing camera with facing mode: ${cameraFacing}`)
      
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('✅ Camera stream obtained')
      setCameraPermission('granted')
      setStream(newStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded, starting playback')
          videoRef.current?.play()
          setIsInitializing(false)
        }
      } else {
        setIsInitializing(false)
      }
    } catch (error) {
      console.error('❌ Camera initialization error:', error)
      setCameraPermission('denied')
      setIsInitializing(false)
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.')
    }
  }

  const requestCameraPermission = async () => {
    setIsInitializing(true)
    setError('')
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      setCameraPermission('granted')
      setStream(newStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsInitializing(false)
        }
      }
    } catch (error) {
      console.error('Camera permission denied:', error)
      setCameraPermission('denied')
      setIsInitializing(false)
      setError('Akses kamera diperlukan untuk mengambil foto selfie.')
    }
  }

  const switchCamera = async () => {
    console.log('🔄 Switching camera - setting states first...')
    
    setIsSwitchingCamera(true)
    setIsInitializing(true)
    setError('')
    
    await new Promise(resolve => setTimeout(resolve, 10))
    
    if (stream) {
      console.log('🛑 Stopping current stream...')
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }

    const newFacing = cameraFacing === 'user' ? 'environment' : 'user'
    console.log(`📱 Switching from ${cameraFacing} to ${newFacing}`)
    setCameraFacing(newFacing)

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: newFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      console.log('✅ New camera stream obtained')
      setStream(newStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Camera switch complete')
          videoRef.current?.play()
          setIsInitializing(false)
          setIsSwitchingCamera(false)
        }
      }
    } catch (error) {
      console.error('❌ Camera switch error:', error)
      setError('Gagal mengganti kamera')
      setIsInitializing(false)
      setIsSwitchingCamera(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedPhoto(photoDataUrl)
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setError('')
    setSuccess('')
    
    if (cameraPermission === 'granted' && !stream) {
      initializeCamera()
    }
  }

  const submitPhoto = async () => {
    if (!capturedPhoto || !location) return

    setUploading(true)
    setError('')

    try {
      const playerId = localStorage.getItem('playerId')
      if (!playerId) {
        throw new Error('Player ID not found')
      }

      const photoUrl = capturedPhoto

      setSuccess('Foto berhasil disimpan! 📸')
      
      setTimeout(() => {
        router.push(`/quiz/${locationId}`)
      }, 1500)

    } catch (error) {
      console.error('Photo submission error:', error)
      setError('Gagal menyimpan foto. Coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const goBack = () => {
    stopCamera()
    router.push(`/scanner/${locationId}`)
  }

  const showCameraNotActive = !stream && !isInitializing && !isSwitchingCamera && cameraPermission === 'granted'
  const showLoadingState = isInitializing || isSwitchingCamera

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
            onClick={goBack}
            className="text-white hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              📸 Foto Selfie
            </h1>
            <p className="text-gray-400 text-sm">{location.name}</p>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4">
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

        {/* Camera Preview or Captured Photo */}
        {!capturedPhoto ? (
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 overflow-hidden backdrop-blur-md">
            <CardContent className="p-0">
              {/* Camera Viewfinder */}
              <div className="relative h-96 bg-black overflow-hidden">
                {/* Video element */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  autoPlay
                />
                
                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Loading overlay */}
                {showLoadingState && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-white text-sm">
                        {isSwitchingCamera ? 'Mengganti kamera...' : 'Memulai kamera...'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Camera not active message */}
                {showCameraNotActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center px-4">
                      <Camera className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                      <p className="text-white mb-4">Kamera tidak aktif</p>
                      <Button 
                        onClick={initializeCamera}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                      >
                        Aktifkan Kamera
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Camera frame overlay */}
                {stream && !showLoadingState && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-64 h-64">
                      {/* Rounded frame corners with glow */}
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl shadow-lg shadow-orange-500/50"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl shadow-lg shadow-orange-500/50"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-500 rounded-bl-2xl shadow-lg shadow-orange-500/50"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-500 rounded-br-2xl shadow-lg shadow-orange-500/50"></div>
                    </div>
                  </div>
                )}

                {/* Instructions overlay */}
                {stream && !showLoadingState && (
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white text-sm bg-black/70 px-4 py-2 rounded-full backdrop-blur-sm">
                      🎃 Pastikan wajah Anda terlihat jelas
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="p-4 border-t border-orange-500/20 bg-gray-900/40 backdrop-blur-sm">
                <div className="flex justify-center items-center gap-4">
                  {/* Switch Camera */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={switchCamera}
                    disabled={showLoadingState || !stream}
                    className="bg-gray-900/50 border-orange-500/30 text-white hover:bg-orange-500/20 transition-all"
                  >
                    <SwitchCamera className="h-5 w-5" />
                  </Button>

                  {/* Capture Button */}
                  <Button
                    size="lg"
                    onClick={capturePhoto}
                    disabled={!stream || showLoadingState}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-8 py-6 rounded-full shadow-lg shadow-orange-500/50"
                  >
                    <Camera className="h-6 w-6 mr-2" />
                    Ambil Foto
                  </Button>

                  {/* Spacer for symmetry */}
                  <div className="w-10"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Photo Preview */
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 overflow-hidden backdrop-blur-md">
            <CardContent className="p-0">
              <div className="relative h-96 bg-black">
                <img 
                  src={capturedPhoto} 
                  alt="Captured selfie" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Preview frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-64 h-64">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-green-500 rounded-tl-2xl shadow-lg shadow-green-500/50"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-green-500 rounded-tr-2xl shadow-lg shadow-green-500/50"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-green-500 rounded-bl-2xl shadow-lg shadow-green-500/50"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-green-500 rounded-br-2xl shadow-lg shadow-green-500/50"></div>
                  </div>
                </div>
              </div>

              {/* Photo Action Buttons */}
              <div className="p-4 border-t border-orange-500/20 bg-gray-900/40 backdrop-blur-sm">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={retakePhoto}
                    className="flex-1 border-orange-500/30 text-white hover:bg-orange-500/10 transition-all"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Ambil Ulang
                  </Button>
                  <Button
                    onClick={submitPhoto}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Lanjutkan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Camera Permission Denied */}
        {cameraPermission === 'denied' && (
          <Card className="bg-red-500/10 border-red-500/30 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Akses Kamera Ditolak
              </h3>
              <p className="text-gray-400 mb-4">
                Foto selfie diperlukan untuk melanjutkan. Izinkan akses kamera di pengaturan browser
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/quiz/${locationId}`)}
                  className="border-orange-500/30 text-white hover:bg-orange-500/10 w-full"
                >
                  Lewati Foto (Lanjut ke Quiz)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Photo Requirements */}
        <Card className="bg-blue-500/10 border-blue-500/20 backdrop-blur-md">
          <CardContent className="p-4">
            <h4 className="text-blue-300 font-semibold text-sm mb-2">📋 Syarat Foto Selfie:</h4>
            <ul className="text-gray-400 text-xs space-y-1 ml-4 list-disc">
              <li>Wajah Anda harus terlihat jelas</li>
              <li>Dekorasi Halloween harus tampak di latar belakang</li>
              <li>Foto harus diambil di lokasi {location.name}</li>
              <li>Pastikan pencahayaan cukup untuk foto yang jelas</li>
            </ul>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Progress Lokasi</span>
              <span className="text-orange-400 font-semibold">Step 2/3</span>
            </div>
            <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span className="text-green-400">✅ QR Scan</span>
              <span className="text-orange-400">📸 Foto Selfie</span>
              <span className="text-gray-500">🧠 Quiz</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}