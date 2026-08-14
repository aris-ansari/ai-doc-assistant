import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/queryProvider";
import { AuthProvider } from "@/providers/authProvider";
import { ThemeProvider } from "@/providers/themeProvider";

export const metadata: Metadata = {
  title: "AI Document Workspace",
  description: "Grounded AI document retrieval workspace",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
