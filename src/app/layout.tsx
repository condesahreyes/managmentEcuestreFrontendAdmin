import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Centro Ecuestre Santa Bárbara · Panel Administrativo',
  description: 'Panel de administración y gestión del centro ecuestre',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
