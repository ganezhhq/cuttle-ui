import type { ReactNode } from 'react';
import '@cuttle-ui/styles';

export const metadata = { title: 'Cuttle SSR check' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
