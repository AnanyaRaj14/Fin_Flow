import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastContainer } from '@/components/ui/toast';

export const metadata = {
  title: 'FinFlow — Personal Finance Dashboard',
  description: 'Manage your money with clarity. Track income, expenses, budgets, and savings goals.',
};

// Inline script to prevent flash of wrong theme on first load
const themeScript = `
  try {
    const t = localStorage.getItem('theme') || 'light';
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
