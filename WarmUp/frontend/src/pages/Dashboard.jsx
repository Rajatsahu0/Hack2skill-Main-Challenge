import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Plus, Calendar, IndianRupee, Users, CloudSun, MapPin, ArrowRight, BellRing, Sparkles, Check, TrendingUp, Flame } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { notifications, unreadCount, markNotificationRead } = useSocket();
  const [trips, setTrips] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [loading, setLoading] = useState(true);
  const [trending, setTrending] = useState({ season: '', destinations: [] });

  // Load Trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get('/api/trips');
        if (response.data.success) {
          setTrips(response.data.trips);
          // Fetch weather for each unique destination
          response.data.trips.forEach(trip => {
            fetchWeather(trip.destination);
          });
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // Load Trending Destinations
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get('/api/trips/trending');
        if (response.data.success) {
          setTrending({ season: response.data.season, destinations: response.data.destinations });
        }
      } catch (error) {
        console.error('Error fetching trending:', error);
      }
    };
    fetchTrending();
  }, []);

  const fetchWeather = async (city) => {
    try {
      const response = await axios.get(`/api/trips/weather/check?city=${encodeURIComponent(city)}`);
      if (response.data.success) {
        setWeatherData(prev => ({
          ...prev,
          [city]: response.data.weather
        }));
      }
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
    }
  };

  // Math aggregates for budget summary
  const totalBudget = trips.reduce((acc, curr) => acc + curr.budget, 0);
  const totalTravelers = trips.reduce((acc, curr) => acc + curr.travelers, 0);
  const avgBudget = trips.length > 0 ? Math.round(totalBudget / trips.length) : 0;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 transition-colors duration-300" role="status" aria-label="Loading dashboard">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium" aria-live="polite">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome Back, {user?.name || 'Explorer'} <Sparkles className="w-6 h-6 text-violet-500" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is a summary of your active travel adventures.</p>
        </div>
        <Link
          to="/create-trip"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-violet-500/20 hover:shadow-violet-600/30 transform hover:-translate-y-0.5 transition-all text-center self-start md:self-auto"
        >
          <Plus className="w-5 h-5" /> Plan a New Trip
        </Link>
      </div>

      {/* Budget Summary & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Total Trips</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{trips.length}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-2xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Total Budget</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">₹{totalBudget.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Avg. Budget</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">₹{avgBudget.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Co-Travelers</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{totalTravelers}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Destinations Section */}
      {trending.destinations.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Trending This {trending.season}
            </h2>
            <span className="text-xs bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Seasonal Picks
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.destinations.map((dest, idx) => (
              <Link
                key={idx}
                to={`/create-trip?destination=${encodeURIComponent(dest.destination)}`}
                className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{dest.image}</span>
                  <span className="text-[10px] bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold px-2 py-0.5 rounded-full">
                    ₹{dest.avgBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {dest.destination}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dest.tagline}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {dest.bestFor.map((tag, i) => (
                    <span key={i} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Trips & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trips Column */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            Your Active Itineraries
          </h2>
          
          {trips.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
              <CloudSun className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No trips generated yet</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-2">
                Use our AI generator to formulate customizable, weather-adaptive day-by-day schedules.
              </p>
              <Link
                to="/create-trip"
                className="inline-flex items-center gap-2 mt-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all"
              >
                Plan a Trip <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {trips.map((trip) => {
                const weather = weatherData[trip.destination];
                return (
                  <div
                    key={trip._id}
                    className="glass-panel rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-slate-200/50 dark:border-slate-850"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      
                      {/* Trip details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-xs tracking-wider uppercase">
                          <MapPin className="w-3.5 h-3.5" /> {trip.travelStyle} Style
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                          {trip.destination}
                        </h3>
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 dark:text-slate-500 mt-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {trip.travelers} Traveler(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                            Budget: ₹{trip.budget.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Weather Status Widget */}
                      {weather ? (
                        <div className="bg-slate-100/50 dark:bg-slate-800/40 rounded-2xl p-4 flex items-center gap-3 border border-slate-200/20 max-w-[200px] shrink-0 self-start sm:self-auto">
                          <img
                            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                            alt={weather.condition}
                            className="w-12 h-12 object-contain"
                          />
                          <div>
                            <div className="text-lg font-bold text-slate-800 dark:text-white leading-none">
                              {weather.temp}°C
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 capitalize mt-0.5">
                              {weather.description}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-32 h-14 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl shrink-0"></div>
                      )}

                      {/* Action Link */}
                      <Link
                        to={`/trips/${trip._id}`}
                        className="p-3.5 rounded-2xl bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/20 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:scale-105 transition-all shrink-0 self-end sm:self-auto"
                        title="View Itinerary Workspace"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications Column */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Recent Alerts <BellRing className="w-5 h-5 text-amber-500" />
            </h2>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="glass-panel rounded-3xl p-6 max-h-[500px] overflow-y-auto border border-slate-200/50 dark:border-slate-800" role="log" aria-live="polite" aria-label="Notification feed">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                No recent notifications logs
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.read) markNotificationRead(notif._id);
                    }}
                    className={`p-3.5 rounded-2xl flex items-start gap-3 transition-all relative ${
                      !notif.read
                        ? 'bg-violet-50/40 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 cursor-pointer'
                        : 'bg-slate-50/50 dark:bg-slate-800/20 border border-transparent'
                    }`}
                  >
                    {!notif.read && (
                      <button
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                        title="Mark as Read"
                      >
                        <Check className="w-3.5 h-3.5 text-violet-500" />
                      </button>
                    )}
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pr-4">
                        {notif.message}
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1.5">
                        {new Date(notif.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
