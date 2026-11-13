import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { StudentDataProvider } from '@/lib/storage/data-store';

export const metadata: Metadata = {
  title: 'Personal AI Student Companion',
  description: 'Deterministic Attendance Engine, Timetable Intelligence & Academic Management',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased flex">
        <StudentDataProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          </div>
          <BottomNav />
        </StudentDataProvider>
      </body>
    </html>
  );
}
