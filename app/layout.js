import { Inter } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import GoogleAnalytics from './components/GoogleAnalytics'
import Providers from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Forever English Corner AI - 深圳英语角 | Free English Learning & Practice in Shenzhen',
  description: 'Join Forever English Corner (深圳英语角) in Shenzhen! Free weekly English practice sessions. AI-powered chat assistant to help with English learning, session info, and community questions. 7+ years of helping English learners!',
  keywords: '英语角, 深圳英语角, English Corner Shenzhen, English practice, language exchange, Futian Station, English learning, AI assistant, conversation practice, international community, free English classes, 英语学习, 英语交流',
  authors: [{ name: 'Forever English Corner' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Forever English Corner AI - 深圳英语角 | Free English Learning in Shenzhen',
    description: 'Join our weekly English practice sessions (深圳英语角). Chat with our AI assistant to learn about session schedules, topics, and community events. 7+ years of English learning fun!',
    url: 'https://www.englishcorner.pro',
    siteName: 'Forever English Corner',
    images: [
      {
        url: 'https://www.englishcorner.pro/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forever English Corner AI - 深圳英语角 | Free English Learning in Shenzhen',
    description: 'Join weekly English practice sessions (深圳英语角). AI assistant helps with schedules, topics & community info. 7+ years of English learning!',
    images: ['https://www.englishcorner.pro/twitter-card.jpg'],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              'name': 'Forever English Corner (深圳英语角)',
              'description': 'Free English practice community in Shenzhen',
              'image': 'https://www.englishcorner.pro/og-image.jpg',
              'url': 'https://www.englishcorner.pro',
              'telephone': '',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'Futian Station, Shenzhen',
                'addressLocality': 'Shenzhen',
                'addressRegion': 'Guangdong',
                'postalCode': '',
                'addressCountry': 'CN'
              },
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': '22.5431',
                'longitude': '114.0579'
              },
              'priceRange': 'Free',
              'openingHoursSpecification': [
                {
                  '@type': 'OpeningHoursSpecification',
                  'dayOfWeek': 'Wednesday',
                  'opens': '19:30',
                  'closes': '22:00'
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  'dayOfWeek': 'Friday',
                  'opens': '19:30',
                  'closes': '22:00'
                }
              ],
              'sameAs': [
                'https://www.englishcorner.pro'
              ]
            })
          }}
        />
      </head>
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
