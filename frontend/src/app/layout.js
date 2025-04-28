import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from './providers';
import Header from '../components/Header'
import Footer from '../components/Footer'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
	title: 'Империя зауча',
	description: 'Пример приложения на Next.js 13',
}


export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <Providers>

          <main style={{ minHeight: '70vh', padding: '10px' }}>
            {children}
          </main>

        </Providers>
      </body>
    </html>
	)
}
