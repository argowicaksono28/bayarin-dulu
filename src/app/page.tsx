"use client"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Play, Calculator, Users, Receipt, Shield, ChevronRight, Star, Quote, ShoppingCart, Package, Car, Ticket, UtensilsCrossed, Scan, Globe, Zap, FileText, Eye, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-2">
          {/* Real logo match */}
          <div className="flex items-center justify-center p-1 rounded-sm bg-primary/10">
             <Image src="/logo.svg" alt="Bayarin Dulu" width={28} height={28} />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">Bayarin Dulu</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground">Sign In</Link>
          <Link href="/auth" className="text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors shadow-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center flex flex-col items-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          The smartest way to split bills
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out text-foreground">
          Split Bills. <br />
          <span className="text-primary">Keep Friends.</span>
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl text-muted-foreground mb-10 text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 ease-out fill-mode-both leading-relaxed font-medium">
          No more awkward math or &quot;who owes what&quot;. Bayarin Dulu handles exact calculations, tax, and service charges effortlessly so you can focus on the memories, not the receipts.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 ease-out fill-mode-both">
          <Link href="/auth" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-1">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/demo" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card hover:bg-muted border text-foreground px-8 py-4 rounded-full font-medium text-lg transition-all hover:shadow-sm group">
            <Play className="w-5 h-5 fill-foreground group-hover:scale-110 transition-transform" />
            Try Interactive Demo
          </Link>
        </div>
      </main>

      {/* Real App Dashboard Mockup (Matching User Reference) */}
      <section className="w-full relative z-10 pt-12 pb-24 overflow-hidden bg-background">
        <div className="w-full max-w-4xl relative animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500 ease-out fill-mode-both mx-auto px-6">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 bottom-0 h-40 pointer-events-none mt-auto"></div>
          
          <div className="bg-[#111318] dark:bg-[#111318] rounded-[1.5rem] shadow-2xl border border-white/5 p-4 md:p-6 transform xl:scale-105 rotate-1 hover:rotate-0 transition-transform duration-500 relative overflow-hidden text-left mx-auto max-w-3xl font-sans">
            {/* App Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-white text-2xl tracking-tight leading-tight">Bali Trip 2025</h3>
                <p className="text-gray-400 text-sm mt-1">5 members · Rp 5.450.000 total</p>
              </div>
              <div className="flex -space-x-1.5">
                {['BS', 'SR', 'AP', 'DK'].map((initials, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${['bg-[#8b5cf6]', 'bg-[#6366f1]', 'bg-[#3b82f6]', 'bg-[#2563eb]'][i]}`}>
                    {initials}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-[#111318] bg-[#2d313a] flex items-center justify-center text-[10px] font-bold text-gray-300 shadow-sm">
                  +1
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-[#1c1f26] rounded-xl flex p-1 mb-6 border border-white/5">
              <div className="flex-1 text-center py-2 bg-[#2d313a] rounded-lg text-white font-bold text-sm shadow">Expenses</div>
              <div className="flex-1 text-center py-2 text-gray-400 font-medium text-sm">Balances</div>
              <div className="flex-1 text-center py-2 text-gray-400 font-medium text-sm">Activity</div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1 bg-[#15171e] border border-white/5 rounded-xl flex items-center px-4 py-2.5 text-gray-400">
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span className="text-sm">Search expenses...</span>
              </div>
              <div className="bg-[#15171e] border border-white/5 rounded-xl w-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              </div>
              <div className="bg-[#2dd4bf] hover:bg-[#14b8a6] transition-colors text-[#064e3b] font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                Add Expense
              </div>
            </div>

            {/* List */}
            <div className="bg-[#1c1f26] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
              {[
                { icon: <ShoppingCart className="w-4 h-4" />, title: "Batik Souvenir Shopping", subtitle: "Paid by Dewi Kusuma · 13 Mar 2025", amount: "Rp 850.000", badge: "exact", isScanned: true },
                { icon: <Package className="w-4 h-4" />, title: "Speedboat to Nusa Penida", subtitle: "Paid by Reza Firmansyah · 13 Mar 2025", amount: "Rp 600.000", badge: "shares", isScanned: false },
                { icon: <Car className="w-4 h-4" />, title: "Motorbike Rental ×5", subtitle: "Paid by Agus Prasetyo · 12 Mar 2025", amount: "Rp 450.000", badge: "equal", isScanned: true },
                { icon: <Ticket className="w-4 h-4" />, title: "Tanah Lot Entrance Tickets", subtitle: "Paid by Budi Santoso · 12 Mar 2025", amount: "Rp 300.000", badge: "percent", isScanned: false },
                { icon: <UtensilsCrossed className="w-4 h-4" />, title: "Dinner at Jimbaran Bay", subtitle: "Paid by Siti Rahayu · 11 Mar 2025", amount: "Rp 750.000", badge: "equal", isScanned: true },
              ].map((item, i) => (
                <div key={i} className="p-5 flex items-center gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-[#272b36] flex items-center justify-center text-gray-300 group-hover:scale-105 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="flex items-center gap-2 text-white font-bold text-[15px] tracking-tight">
                      {item.title}
                      {item.isScanned && <Scan className="w-3.5 h-3.5 text-[#2dd4bf] opacity-80" />}
                    </h4>
                    <p className="text-gray-400 text-[13px] mt-0.5">{item.subtitle}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <p className="text-white font-bold text-[15px]">Rp {item.amount.split(' ')[1]}</p>
                      <div className="mt-1">
                        <span className="text-[10px] lowercase font-bold px-2 py-0.5 rounded bg-[#0f3d33] text-[#2dd4bf]">{item.badge}</span>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-background py-24 sm:py-32 border-t relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 tracking-tight">Designed for pure utility</h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium">Everything you need to divvy up costs transparently, without the bloat.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                icon: <Calculator className="w-6 h-6 text-primary" />,
                title: "Flawless Math",
                desc: "Subtotals, tax percentages, and service fees are calculated individually. No more rounding disputes."
              },
              {
                icon: <Receipt className="w-6 h-6 text-primary" />,
                title: "Receipt Scanning",
                desc: "Use our AI camera scanner to automatically extract items from physical restaurant receipts."
              },
              {
                icon: <Users className="w-6 h-6 text-primary" />,
                title: "Group Tracking",
                desc: "Keep a transparent ledger of who paid for what in real-time. Share it instantly with friends."
              },
              {
                icon: <Eye className="w-6 h-6 text-primary" />,
                title: "View-Only Links",
                desc: "Send a custom URL to your friends. They can see their exact breakdown instantly without signing up or downloading anything."
              },
              {
                icon: <Zap className="w-6 h-6 text-primary" />,
                title: "Instant Sync",
                desc: "Updates push instantly to all group members. Never wonder if someone has settled their share."
              },
              {
                icon: <Sparkles className="w-6 h-6 text-primary" />,
                title: "Pure Simplicity",
                desc: "We stripped away the clutter. A clean, hyper-focused interface designed purely to get your group squared away fast."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 sm:p-10 rounded-3xl bg-card border hover:border-primary/50 transition-colors shadow-sm hover:shadow-md group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-card py-24 sm:py-32 border-t relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">Loved by friends who hate math.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                quote: "This app literally saved my friendships. No more Venmo requesting someone for exactly $14.32 while explaining the tax breakdown. It just handles it.",
                author: "Sarah J.",
                role: "Design Lead",
              },
              {
                quote: "We used to spend 15 minutes at the end of every dinner trying to figure out who owes what. Now I just scan the receipt, tap their names, and we leave.",
                author: "Mike T.",
                role: "Software Engineer",
              },
              {
                quote: "The receipt scanner is magic. It caught all the hidden service charges and distributed them evenly based on our subtotals. Pure genius.",
                author: "Emily R.",
                role: "Event Planner",
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-background rounded-3xl p-8 border hover:shadow-md transition-shadow relative">
                <Quote className="w-10 h-10 text-primary/20 absolute top-8 right-8" />
                <div className="flex gap-1 mb-6">
                   {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-primary text-primary" />)}
                </div>
                <p className="text-foreground font-medium text-lg mb-8 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 sm:mt-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <p className="text-muted-foreground font-medium text-lg italic">
              ...and 100+ happy testimonies from our users
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-background py-24 sm:py-32 border-t relative z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">Everything you need to know about Bayarin Dulu.</p>
          </div>
          <div className="space-y-6">
            {[
              {
                q: "Is Bayarin Dulu free to use?",
                a: "Yes! Core features like manual bill splitting and live link sharing are 100% free forever for unlimited groups."
              },
              {
                q: "How does the AI receipt scanner work?",
                a: "Just take a picture of your physical receipt. Our integration with top-tier AI instantly reads the text, extracts the item names, prices, and even calculates the tax percentage automatically."
              },
              {
                q: "Do my friends need to download the app to pay me?",
                a: "No! Your friends don't need to sign up or download anything. Just send them your unique split link, and they can view their exact breakdown seamlessly on the web."
              },
              {
                q: "Does it support different currencies?",
                a: "Absolutely. You can set the base currency for your group expenses natively."
              }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-card border rounded-2xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-6 font-bold text-lg text-foreground marker:content-none font-sans outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  {faq.q}
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-6 pb-6 text-muted-foreground text-lg leading-relaxed border-t pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 tracking-tight">Ready to end the math drama?</h2>
        <Link href="/auth" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-5 rounded-full font-bold text-lg md:text-xl transition-all hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
          Start Splitting Now
          <ChevronRight className="w-6 h-6" />
        </Link>
      </section>
      
      {/* Footer minimal */}
      <footer className="border-t py-12 text-center text-muted-foreground text-sm max-w-7xl mx-auto w-full font-medium">
        <p>© {new Date().getFullYear()} Bayarin Dulu. Made for painless group dining.</p>
      </footer>
    </div>
  )
}
