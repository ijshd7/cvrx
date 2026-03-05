import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "CVRX - AI Resume & CV Generator",
  description:
    "Generate tailored resumes and CVs using AI, optimized for any job listing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
