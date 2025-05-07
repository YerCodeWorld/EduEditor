import { JetBrains_Mono, Open_Sans } from "next/font/google";
import { Metadata } from "next";

const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const fontSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Next Tiptap",
  description: "A modern WYSIWYG rich text editor based on tiptap and shadcn ui for ReactJs/NextJs",
  keywords: "Tiptap, WYSIWYG, Rich Text Editor, ReactJS, NextJS",
  metadataBase: new URL(`https://edu-text-phi.vercel.app`),
  openGraph: {
    type: "website",
    url: `https://edu-text-phi.vercel.app`,
    title: "EduEditor",
    description:
      "A modern WYSIWYG rich text editor based on tiptap and shadcn(?) ui for ReactJs/NextJs",
    siteName: "Next Tiptap",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontMono.variable} ${fontSans.variable}`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
