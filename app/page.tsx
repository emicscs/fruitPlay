"use client"

import { useState, useEffect, useRef } from "react"
import { ExternalLink, Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

// Sample music data
const sampleTracks = [
  {
    id: 1,
    title: "Breathe",
    artist: "The Midnight",
    album: "Days of Thunder",
    cover: "/placeholder.svg?height=300&width=300",
    duration: 245,
  },
  {
    id: 2,
    title: "Crystallize",
    artist: "Synthwave Dreams",
    album: "Neon Horizons",
    cover: "/placeholder.svg?height=300&width=300",
    duration: 198,
  },
  {
    id: 3,
    title: "Sunset Drive",
    artist: "FM-84",
    album: "Atlas",
    cover: "/placeholder.svg?height=300&width=300",
    duration: 267,
  },
  {
    id: 4,
    title: "Digital Love",
    artist: "Daft Punk",
    album: "Discovery",
    cover: "/placeholder.svg?height=300&width=300",
    duration: 301,
  },
]

export default function Home() {
  const [currentTrack, setCurrentTrack] = useState(sampleTracks[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [popoutWindow, setPopoutWindow] = useState<Window | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Initialize BroadcastChannel for communication
  useEffect(() => {
    channelRef.current = new BroadcastChannel("music_player_channel")

    // Listen for messages from popout window
    channelRef.current.onmessage = (event) => {
      const { type, data } = event.data

      switch (type) {
        case "REQUEST_STATE":
          // Send current state to popout window
          sendStateUpdate()
          break
        case "TOGGLE_PLAY":
          setIsPlaying((prev) => !prev)
          break
        case "PREVIOUS_TRACK":
          handlePrevious()
          break
        case "NEXT_TRACK":
          handleNext()
          break
        case "SEEK":
          setCurrentTime(data.time)
          break
        case "VOLUME":
          setVolume(data.volume)
          break
      }
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close()
      }
    }
  }, [])

  // Send state updates to popout window
  const sendStateUpdate = () => {
    if (!channelRef.current) return

    // Send track info
    channelRef.current.postMessage({
      type: "TRACK_UPDATE",
      data: { track: currentTrack },
    })

    // Send playback state
    channelRef.current.postMessage({
      type: "PLAYBACK_UPDATE",
      data: { isPlaying },
    })

    // Send current time
    channelRef.current.postMessage({
      type: "TIME_UPDATE",
      data: { currentTime },
    })

    // Send volume
    channelRef.current.postMessage({
      type: "VOLUME_UPDATE",
      data: { volume },
    })
  }

  // Update popout window when state changes
  useEffect(() => {
    sendStateUpdate()
  }, [currentTrack, isPlaying, currentTime, volume])

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= currentTrack.duration) {
            // Move to next track when current one ends
            const nextTrackIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id) + 1
            if (nextTrackIndex < sampleTracks.length) {
              setCurrentTrack(sampleTracks[nextTrackIndex])
            } else {
              setCurrentTrack(sampleTracks[0])
            }
            return 0
          }
          return prevTime + 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentTrack])

  // Handle playback controls
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    const currentIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id)
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : sampleTracks.length - 1
    setCurrentTrack(sampleTracks[prevIndex])
    setCurrentTime(0)
  }

  const handleNext = () => {
    const currentIndex = sampleTracks.findIndex((t) => t.id === currentTrack.id)
    const nextIndex = currentIndex < sampleTracks.length - 1 ? currentIndex + 1 : 0
    setCurrentTrack(sampleTracks[nextIndex])
    setCurrentTime(0)
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  // Open popout window
  const openPopoutWindow = () => {
    // Close existing popout if open
    if (popoutWindow && !popoutWindow.closed) {
      popoutWindow.focus()
      return
    }

    // Calculate window size and position
    const width = 400
    const height = 500
    const left = window.screen.width - width
    const top = window.screen.height - height - 100

    // Open new window
    const newWindow = window.open(
      "/popout",
      "MusicPlayerPopout",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,status=no,location=no,menubar=no,toolbar=no`,
    )

    if (newWindow) {
      setPopoutWindow(newWindow)

      // Check if window is closed
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed)
          setPopoutWindow(null)
        }
      }, 1000)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-3xl">
        <div className="frutiger-container p-6 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 shadow-xl">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="album-cover-container">
                <img
                  src={currentTrack.cover || "/placeholder.svg"}
                  alt={`${currentTrack.album} cover`}
                  className="w-64 h-64 rounded-lg object-cover shadow-lg border border-white/30"
                />
                <div className="album-reflection"></div>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white drop-shadow-md">{currentTrack.title}</h1>
                    <p className="text-lg text-blue-100">{currentTrack.artist}</p>
                    <p className="text-sm text-blue-200">{currentTrack.album}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/30 hover:bg-white/40 text-white"
                    onClick={openPopoutWindow}
                    title="Open in popout window"
                  >
                    <ExternalLink size={20} />
                  </Button>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-blue-100 mb-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>
                  <Slider
                    value={[currentTime]}
                    max={currentTrack.duration}
                    step={1}
                    onValueChange={handleSeek}
                    className="progress-slider"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-center items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white/30 hover:bg-white/40 text-white"
                    onClick={handlePrevious}
                  >
                    <SkipBack size={24} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-16 w-16 rounded-full bg-white/40 hover:bg-white/50 text-white"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white/30 hover:bg-white/40 text-white"
                    onClick={handleNext}
                  >
                    <SkipForward size={24} />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 size={18} className="text-blue-100" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-blue-200 text-sm">
          <p>Currently playing from your local library</p>
          {popoutWindow && !popoutWindow.closed && <p className="mt-1">Popout player is active</p>}
        </div>
      </div>
    </main>
  )
}

