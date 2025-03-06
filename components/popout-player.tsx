"use client"

import { useState } from "react"
import { X, Play, Pause, SkipBack, SkipForward, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Draggable from "react-draggable"

interface Track {
  id: number
  title: string
  artist: string
  album: string
  cover: string
  duration: number
}

interface PopoutPlayerProps {
  track: Track
  isPlaying: boolean
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onClose: () => void
}

export default function PopoutPlayer({
  track,
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onClose,
}: PopoutPlayerProps) {
  const [isPinned, setIsPinned] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const togglePin = () => {
    setIsPinned(!isPinned)
  }

  const handleDragStop = (e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y })
  }

  return (
    <Draggable handle=".drag-handle" position={position} onStop={handleDragStop} bounds="body">
      <div
        className={cn(
          "fixed top-4 right-4 z-50 w-72 rounded-xl overflow-hidden",
          "backdrop-blur-md bg-white/20 border border-white/30 shadow-xl",
          "transition-all duration-300",
          isPinned ? "popout-pinned" : "",
        )}
      >
        <div className="drag-handle p-3 bg-gradient-to-r from-blue-600/70 to-indigo-600/70 cursor-move flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white"
              onClick={togglePin}
            >
              <Pin size={12} className={cn(isPinned ? "text-blue-300" : "text-white")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 text-white"
              onClick={onClose}
            >
              <X size={12} />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <img
              src={track.cover || "/placeholder.svg"}
              alt={`${track.album} cover`}
              className="w-16 h-16 rounded-md object-cover shadow-md border border-white/30"
            />
            <div className="flex-grow overflow-hidden">
              <h3 className="text-white font-medium truncate">{track.title}</h3>
              <p className="text-sm text-blue-100 truncate">{track.artist}</p>
              <p className="text-xs text-blue-200 truncate">{track.album}</p>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
              onClick={onPrevious}
            >
              <SkipBack size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-white/30 hover:bg-white/40 text-white"
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
              onClick={onNext}
            >
              <SkipForward size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

