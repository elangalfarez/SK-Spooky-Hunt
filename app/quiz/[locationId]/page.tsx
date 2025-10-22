// app/quiz/[locationId]/page.tsx
// Updated: World-class Halloween design with spooky atmosphere

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  X,
  Trophy,
  Clock,
  Brain,
  Skull,
  RotateCcw
} from "lucide-react"
import { supabaseApi, Location } from "@/lib/supabase"

interface QuizAnswer {
  option: string
  label: string
}

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  
  const [location, setLocation] = useState<Location | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cooldownTime, setCooldownTime] = useState<number>(0)
  const [attempts, setAttempts] = useState<number>(0)
  
  const locationId = params.locationId as string

  useEffect(() => {
    const playerId = localStorage.getItem('playerId')
    if (!playerId) {
      router.push('/')
      return
    }

    loadLocationData()
    checkCooldown()
  }, [locationId, router])

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [cooldownTime])

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

  const checkCooldown = async () => {
    try {
      const playerId = localStorage.getItem('playerId')
      if (!playerId) return

      const cooldownKey = `quiz_cooldown_${playerId}_${locationId}`
      const cooldownEnd = localStorage.getItem(cooldownKey)
      const attemptsKey = `quiz_attempts_${playerId}_${locationId}`
      const playerAttempts = parseInt(localStorage.getItem(attemptsKey) || '0')

      setAttempts(playerAttempts)

      if (cooldownEnd) {
        const endTime = parseInt(cooldownEnd)
        const now = Date.now()
        
        if (now < endTime) {
          const remainingSeconds = Math.ceil((endTime - now) / 1000)
          setCooldownTime(remainingSeconds)
        }
      }
    } catch (error) {
      console.error('Error checking cooldown:', error)
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}j ${minutes}m ${secs}d`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}d`
    } else {
      return `${secs}d`
    }
  }

  const submitAnswer = async () => {
    if (!selectedAnswer || !location || cooldownTime > 0) return

    setLoading(true)
    setError('')

    try {
      const playerId = localStorage.getItem('playerId')
      if (!playerId) {
        throw new Error('Player ID not found')
      }

      const result = await supabaseApi.submitQuizAnswer(
        parseInt(playerId),
        locationId,
        selectedAnswer
      )

      setShowResult(true)
      
      if (result.success && result.correct) {
        setIsCorrect(true)
        setSuccess('🎉 Selamat! Anda telah menyelesaikan lokasi ini!')
        
        const cooldownKey = `quiz_cooldown_${playerId}_${locationId}`
        const attemptsKey = `quiz_attempts_${playerId}_${locationId}`
        localStorage.removeItem(cooldownKey)
        localStorage.removeItem(attemptsKey)

        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
        
      } else if (result.success && !result.correct) {
        setIsCorrect(false)
        setError(result.message || '❌ Jawaban salah!')
        
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        const attemptsKey = `quiz_attempts_${playerId}_${locationId}`
        localStorage.setItem(attemptsKey, newAttempts.toString())
        
      } else {
        setError(result.message || 'Terjadi kesalahan sistem')
      }

    } catch (error) {
      console.error('Quiz submission error:', error)
      setError('Terjadi kesalahan. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  const resetQuiz = () => {
    setSelectedAnswer('')
    setShowResult(false)
    setError('')
    setSuccess('')
  }

  const goBack = () => {
    router.push('/dashboard')
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#1a0f1f] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Memuat quiz...</p>
        </div>
      </div>
    )
  }

  const quizOptions: QuizAnswer[] = location.quiz_options.map((option, index) => ({
    option: ['A', 'B', 'C', 'D'][index],
    label: option
  }))

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
              🧠 Quiz Spooky
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
            <Trophy className="h-5 w-5 text-green-400" />
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

        {/* Cooldown Notice */}
        {cooldownTime > 0 && (
          <Card className="bg-gradient-to-br from-orange-900/40 to-red-950/20 border-2 border-orange-500/30 backdrop-blur-md">
            <CardContent className="p-6 text-center">
              <Clock className="w-16 h-16 text-orange-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-orange-400 mb-2">
                ⏳ Waktu Tunggu Aktif
              </h3>
              <p className="text-gray-400 mb-4">
                Anda perlu menunggu sebelum dapat mencoba quiz lagi
              </p>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
                {formatTime(cooldownTime)}
              </div>
              <p className="text-gray-400 text-sm">
                Silakan kembali setelah cooldown selesai
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quiz Card */}
        {cooldownTime === 0 && (
          <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 backdrop-blur-md">
            <CardContent className="p-6">
              {/* Quiz Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Brain className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Pertanyaan Quiz</h3>
                  <p className="text-sm text-gray-400">
                    {attempts > 0 ? `Percobaan ke-${attempts + 1}` : 'Percobaan pertama'}
                  </p>
                </div>
              </div>

              {/* Question */}
              <div className="mb-6 p-4 bg-gradient-to-br from-purple-900/30 to-purple-950/20 border border-purple-500/30 rounded-lg">
                <p className="text-white text-lg leading-relaxed">
                  {location.quiz_question}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {quizOptions.map((answer) => {
                  const isSelected = selectedAnswer === answer.option
                  const isCorrectAnswer = showResult && answer.option === location.correct_answer
                  const isWrongSelection = showResult && isSelected && !isCorrect
                  
                  return (
                    <button
                      key={answer.option}
                      onClick={() => !showResult && setSelectedAnswer(answer.option)}
                      disabled={showResult || loading || cooldownTime > 0}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                        isCorrectAnswer
                          ? 'bg-green-500/20 border-green-500/50 shadow-lg shadow-green-500/20'
                          : isWrongSelection
                          ? 'bg-red-500/20 border-red-500/50 shadow-lg shadow-red-500/20'
                          : isSelected
                          ? 'bg-orange-500/20 border-orange-500/50 shadow-lg shadow-orange-500/20'
                          : 'bg-gray-900/40 border-gray-700/30 hover:border-orange-500/40 hover:bg-gray-900/60'
                      } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isCorrectAnswer
                            ? 'bg-green-500 text-white'
                            : isWrongSelection
                            ? 'bg-red-500 text-white'
                            : isSelected
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {answer.option}
                        </div>
                        <span className={`flex-1 ${
                          isCorrectAnswer || isWrongSelection || isSelected
                            ? 'text-white font-medium'
                            : 'text-gray-300'
                        }`}>
                          {answer.label}
                        </span>
                        {isCorrectAnswer && (
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                        )}
                        {isWrongSelection && (
                          <X className="w-6 h-6 text-red-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Result Display */}
              {showResult && (
                <div className={`mb-6 p-4 rounded-lg border-2 backdrop-blur-sm ${
                  isCorrect 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-red-500/30 bg-red-500/10'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <X className="w-8 h-8 text-red-400" />
                    )}
                    <span className={`text-xl font-semibold ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isCorrect ? '🎉 Jawaban Benar!' : '❌ Jawaban Salah!'}
                    </span>
                  </div>
                  
                  <div className="text-white space-y-2">
                    <p>
                      <strong>Jawaban Anda:</strong> {selectedAnswer}. {quizOptions.find(q => q.option === selectedAnswer)?.label}
                    </p>
                    {!isCorrect && (
                      <p>
                        <strong>Jawaban yang benar:</strong> {location.correct_answer}. {quizOptions.find(q => q.option === location.correct_answer)?.label}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {!showResult && (
                <Button
                  onClick={submitAnswer}
                  disabled={!selectedAnswer || loading || cooldownTime > 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-6 text-lg shadow-lg shadow-orange-500/30 transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Memeriksa Jawaban...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Kirim Jawaban
                    </>
                  )}
                </Button>
              )}

              {/* Reset Button (for wrong answers) */}
              {showResult && !isCorrect && cooldownTime === 0 && (
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  className="w-full border-orange-500/30 text-white hover:bg-orange-500/10 py-6 text-lg"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Coba Lagi
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quiz Info */}
        <Card className="bg-blue-500/10 border-blue-500/20 backdrop-blur-md">
          <CardContent className="p-4">
            <h4 className="text-blue-300 font-semibold text-sm mb-2 flex items-center gap-2">
              <Skull className="w-4 h-4" />
              Aturan Quiz:
            </h4>
            <ul className="text-gray-400 text-xs space-y-1 ml-4 list-disc">
              <li>Jawab pertanyaan tentang Halloween dengan benar</li>
              <li>Jika jawaban salah, Anda harus menunggu 3 jam sebelum mencoba lagi</li>
              <li>Setelah menjawab benar, lokasi ini akan terselesaikan</li>
              <li>Lanjutkan ke lokasi berikutnya untuk melengkapi spooky hunt</li>
            </ul>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <Card className="bg-gradient-to-br from-gray-900/60 to-gray-950/40 border-2 border-orange-500/30 backdrop-blur-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Progress Lokasi</span>
              <span className="text-orange-400 font-semibold">Step 3/3</span>
            </div>
            <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span className="text-green-400">✅ QR Scan</span>
              <span className="text-green-400">✅ Foto Selfie</span>
              <span className={cooldownTime > 0 ? 'text-orange-400' : 'text-orange-400'}>
                🧠 Quiz
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}