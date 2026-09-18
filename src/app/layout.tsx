import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "MERIDIAN · Data Analyst Template",
  description: "A hyperscale real-time tick lakehouse for capital markets. Synthetic data analyst dashboard with pipelines, datasets, ML models, governance, and SLO monitoring.",
  keywords: ["data analyst", "lakehouse", "Apache Iceberg", "Flink", "Kafka", "fintech", "capital markets", "SRE", "data platform"],
  authors: [{ name: "MERIDIAN Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
