import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({
  subsets: ['latin']
})

export const metadata = {
  title: "Welth",
  description: "One Stop Finance",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.className}`}
    >
      <body>
        <ClerkProvider>
          <header>
            <Header />
          </header>

          <main className="min-h-screen">{children}</main>
          
          <footer>
            <div className="py-12 bg-blue-50 text-center text-gray-600">
              <p>Made with ❤️ by Abhishek</p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
