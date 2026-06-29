import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neplim Store",
  description: "Loja de jogos Steam da Neplim Store",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
