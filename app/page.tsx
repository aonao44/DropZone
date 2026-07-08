import { AnimatedLanding } from "@/components/animated-landing"
import Header from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-slate-100 focus:px-4 focus:py-2 focus:text-slate-900"
      >
        メインコンテンツへスキップ
      </a>
      <Header />
      <main id="main">
        <AnimatedLanding />
      </main>
      <Footer />
    </>
  )
}
