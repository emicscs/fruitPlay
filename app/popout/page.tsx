"use client"

import { useEffect, useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

// Track interface
interface Track {
  id: number
  title: string
  artist: string
  album: string
  cover: string
  duration: number
}

export default function PopoutPlayerPage() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Initialize BroadcastChannel for communication with main window
  useEffect(() => {
    // Set window title
    document.title = "Music Player"

    // Apply custom styles to make it look like a desktop app
    document.body.classList.add("popout-window")

    // Create broadcast channel for communication
    const channel = new BroadcastChannel("music_player_channel")

    // Listen for messages from main window
    channel.onmessage = (event) => {
      const { type, data } = event.data

      switch (type) {
        case "TRACK_UPDATE":
          setCurrentTrack(data.track)
          break
        case "PLAYBACK_UPDATE":
          setIsPlaying(data.isPlaying)
          break
        case "TIME_UPDATE":
          setCurrentTime(data.currentTime)
          break
        case "VOLUME_UPDATE":
          setVolume(data.volume)
          break
      }
    }

    // Request initial state
    channel.postMessage({ type: "REQUEST_STATE" })

    return () => {
      channel.close()
    }
  }, [])

  // Handle playback controls
  const handlePlayPause = () => {
    const channel = new BroadcastChannel("music_player_channel")
    channel.postMessage({ type: "TOGGLE_PLAY" })
    channel.close()
  }

  const handlePrevious = () => {
    const channel = new BroadcastChannel("music_player_channel")
    channel.postMessage({ type: "PREVIOUS_TRACK" })
    channel.close()
  }

  const handleNext = () => {
    const channel = new BroadcastChannel("music_player_channel")
    channel.postMessage({ type: "NEXT_TRACK" })
    channel.close()
  }

  const handleSeek = (value: number[]) => {
    const channel = new BroadcastChannel("music_player_channel")
    channel.postMessage({ type: "SEEK", data: { time: value[0] } })
    channel.close()
  }

  const handleVolumeChange = (value: number[]) => {
    const channel = new BroadcastChannel("music_player_channel")
    channel.postMessage({ type: "VOLUME", data: { volume: value[0] } })
    channel.close()
  }

  // If no track data yet, show loading
  if (!currentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="text-white">Loading player...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 p-4">
      <div className="w-full max-w-md">
        <div className="frutiger-container p-4 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex-shrink-0 mx-auto">
              <div className="album-cover-container">
                <img
                  src={currentTrack.cover || "/placeholder.svg"}
                  alt={`${currentTrack.album} cover`}
                  className="w-48 h-48 rounded-lg object-cover shadow-lg border border-white/30 mx-auto"
                />
                <div className="album-reflection"></div>
              </div>
            </div>

            <div className="flex-grow flex flex-col justify-between">
              <div>
                <div className="text-center mb-3">
                  <h1 className="text-xl font-bold text-white drop-shadow-md">{currentTrack.title}</h1>
                  <p className="text-md text-blue-100">{currentTrack.artist}</p>
                  <p className="text-sm text-blue-200">{currentTrack.album}</p>
                </div>

                <div className="mb-4">
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
                <div className="flex justify-center items-center gap-4 mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/30 hover:bg-white/40 text-white"
                    onClick={handlePrevious}
                  >
                    <SkipBack size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 rounded-full bg-white/40 hover:bg-white/50 text-white"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/30 hover:bg-white/40 text-white"
                    onClick={handleNext}
                  >
                    <SkipForward size={20} />
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
      </div>
    </div>
  )
}

