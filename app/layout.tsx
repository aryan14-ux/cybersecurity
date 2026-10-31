import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XSS Detection Lab — Learn Cross-Site Scripting by Doing",
  description:
    "A professional cybersecurity training platform for learning, detecting, and preventing Cross-Site Scripting (XSS) vulnerabilities through hands-on labs and challenges.",
  keywords:
    "XSS, Cross-Site Scripting, cybersecurity, security training, web security, penetration testing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased scanline">{children}</body>
    </html>
  );
}
