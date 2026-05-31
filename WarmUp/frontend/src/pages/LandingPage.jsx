import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, CloudRain, MapPin, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-gradient-to-b from-slate-50 to-slate-100 dark:from-darkbg-900 dark:to-slate-900 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0">
          <div className="h-1/3 bg-transparent sm:h-2/3"></div>
          {/* Subtle decorative mesh gradients */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-violet-400/20 dark:bg-violet-600/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/20 dark:bg-teal-600/10 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-semibold tracking-wide uppercase mb-6 animate-fade-in">
              <Sparkles className="w-4.5 h-4.5" /> Next-Gen AI Travel Planner
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:leading-none">
              <span className="block">Plan Smart. Travel Easy.</span>
              <span className="block bg-gradient-to-r from-violet-600 to-teal-500 bg-clip-text text-transparent mt-2">
                Adaptive AI Experience
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate personalized daily schedules, monitor weather alerts automatically, and dynamically replan when conditions change. Complete with an interactive map and a smart AI assistant.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 hover:shadow-violet-600/30 transform hover:-translate-y-0.5 transition-all text-center"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 glass-panel text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-12 bg-white dark:bg-darkbg-800/40 border-t border-b border-slate-200/50 dark:border-slate-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-darkbg-800/80 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">AI-Powered Generation</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Utilize advanced models to create tailored day-by-day routes complete with dining, transport, and attraction costs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-darkbg-800/80 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                <CloudRain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Weather-Responsive Replanning</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Keep outdoor plans safe. The engine automatically reroutes outdoor visits to indoor alternatives when rain or storms occur.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-darkbg-800/80 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Interactive Navigation Map</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualize your route markers and path lines on our responsive map. Leaflet integration ensures visual map rendering anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white font-bold mb-3">1</span>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Set Preferences</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Submit budget, style, pacing, and constraints.</p>
          </div>
          <div className="text-center p-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white font-bold mb-3">2</span>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Get AI Itinerary</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">AI drafts day-by-day suggestions instantly.</p>
          </div>
          <div className="text-center p-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white font-bold mb-3">3</span>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Monitor Weather</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Live checks trigger automatic weather replans.</p>
          </div>
          <div className="text-center p-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 text-white font-bold mb-3">4</span>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Chat & Tweak</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">Use AI Assistant chat to update plans dynamically.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-100/50 dark:bg-darkbg-900/50 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} RoamAI Inc. Powered by OpenAI, Google Maps, and OpenWeather APIs.
      </footer>
    </div>
  );
}
