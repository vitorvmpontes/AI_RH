import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', 
});

export const metadata = {
  title: {
    template: '%s | AIRH',
    default: 'AIRH - Recrutamento Inteligente',
  },
  description: 'Plataforma de recrutamento que analisa currículos usando Inteligência Artificial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}