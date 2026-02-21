import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
    variable: "--font-dm-sans",
    subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Dragon Seats — Inventory Management",
    description:
        "Inventory management portal for Dragon Seats climate-controlled benches and accessories",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body
                className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
            >
                {children}
                <Toaster richColors position="bottom-right" />
            </body>
        </html>
    );
}
