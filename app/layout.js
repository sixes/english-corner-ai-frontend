import { Inter } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import GoogleAnalytics from './components/GoogleAnalytics'
import Providers from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Forever English Corner AI - Free English Learning & Practice in Shenzhen',
  description: 'Join Forever English Corner in Shenzhen! Free weekly English practice sessions. AI-powered chat assistant to help with English learning, session info, and community questions. Over 7 years of helping English learners!',
  keywords: 'English Corner Shenzhen, English practice, language exchange, Futian Station, English learning, AI assistant, conversation practice, international community, free English classes',
  authors: [{ name: 'Forever English Corner' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Forever English Corner AI - Free English Learning in Shenzhen',
    description: 'Join our weekly English practice sessions. Chat with our AI assistant to learn about session schedules, topics, and community events. 7+ years of English learning fun!',
    url: 'https://www.englishcorner.cyou',
    siteName: 'Forever English Corner',
    images: [
      {
        url: 'https://www.englishcorner.cyou/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forever English Corner AI - Free English Learning in Shenzhen',
    description: 'Join weekly English practice sessions. AI assistant helps with schedules, topics & community info. 7+ years of English learning!',
    images: ['https://www.englishcorner.cyou/twitter-card.jpg'],
  },
  other: {
    'geo.region': 'CN-44',
    'geo.placename': 'Shenzhen, Guangdong, China',
    'geo.position': '22.5431;114.0579',
    'ICBM': '22.5431, 114.0579',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleAnalytics />
        <Providers>
          {children}
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
