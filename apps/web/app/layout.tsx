import { Geist_Mono, Outfit, Noto_Serif } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils";

const notoSerifHeading = Noto_Serif({subsets:['latin'],variable:'--font-heading'});

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})

const geistMono = Geist_Mono({subsets:['latin'],variable:'--font-mono'})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", geistMono.variable, "font-sans", outfit.variable, notoSerifHeading.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
