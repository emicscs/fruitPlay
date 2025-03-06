import type React from "react"
export default function PopoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="popout-window">{children}</body>
    </html>
  )
}

