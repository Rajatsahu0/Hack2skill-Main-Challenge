import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import TravelMap from '../components/TravelMap';
import {
  Compass, Calendar, IndianRupee, Users, Sparkles, Send, CloudRain, ShieldAlert,
  ArrowLeft, Landmark, Utensils, Car, HelpCircle, Activity, RefreshCw, AlertTriangle
} from 'lucide-react';

export default function TripDetails() {
  const { id: tripId } = useParams();
  const { socket, addLocalNotification } = useSocket();

  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [selectedDay, setSelectedDay] = useState('day1');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat Assistant State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hi! I\'m your AI travel coordinator for this trip. I can help you:\n• Adjust budget or costs\n• Add/remove activities\n• Suggest local food spots\n• Swap outdoor/indoor plans\n• Find nearby attractions\n\nJust type what you\'d like to change!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [replanLoading, setReplanLoading] = useState(false);
  const [expandedSlot, setExpandedSlot] = useState(null);

  const chatEndRef = useRef(null);

  // Fetch Trip & Itinerary data
  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/trips/${tripId}`);
      if (response.data.success) {
        setTrip(response.data.trip);
        setItinerary(response.data.itinerary);
        
        // Fetch weather for destination
        fetchDestinationWeather(response.data.trip.destination);
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinationWeather = async (city) => {
    try {
      const response = await axios.get(`/api/trips/weather/check?city=${encodeURIComponent(city)}`);
      if (response.data.success) {
        setWeather(response.data.weather);
      }
    } catch (error) {
      console.error('Error checking weather:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Socket.IO event hook: Listen for itinerary updates or weather alerts for this trip
  useEffect(() => {
    if (!socket) return;

    const handleSocketNotif = (notif) => {
      if (notif.data && notif.data.tripId === tripId) {
        // Highlight alert on timeline & refresh details
        addLocalNotification(`Real-Time Sync: ${notif.message}`, notif.type);
        
        if (notif.type === 'itinerary_updated') {
          // Re-fetch the updated itinerary
          axios.get(`/api/trips/${tripId}`).then(res => {
            if (res.data.success) {
              setItinerary(res.data.itinerary);
            }
          });
        }
      }
    };

    socket.on('notification', handleSocketNotif);

    return () => {
      socket.off('notification', handleSocketNotif);
    };
  }, [socket, tripId]);

  // Chat message submit
  const handleChatSubmit = async (e, directText = null) => {
    if (e) e.preventDefault();
    const textToSend = directText || chatInput;
    if (!textToSend.trim()) return;

    const newMessages = [...chatMessages, { sender: 'user', text: textToSend }];
    setChatMessages(newMessages);
    if (!directText) setChatInput('');
    setChatLoading(true);

    try {
      const response = await axios.post(`/api/itineraries/${tripId}/chat`, { message: textToSend });
      if (response.data.success) {
        setItinerary(response.data.itinerary);
        setChatMessages(prev => [
          ...prev,
          { sender: 'ai', text: response.data.aiResponse }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Sorry, I encountered an issue updating your itinerary. Please try again.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Weather simulation replan
  const handleSimulateWeather = async (condition) => {
    setReplanLoading(true);
    addLocalNotification(`Triggering weather simulation: ${condition}...`, 'weather_alert');
    try {
      const response = await axios.post(`/api/itineraries/${tripId}/replan`, {
        simulateCondition: condition
      });
      if (response.data.success) {
        setItinerary(response.data.itinerary);
        if (response.data.weather) {
          setWeather(response.data.weather);
        }
        setChatMessages(prev => [
          ...prev,
          { sender: 'ai', text: `⚠️ Weather disruption detected! I have automatically replanned your itinerary to include indoor activities because of ${condition}.` }
        ]);
      }
    } catch (error) {
      console.error('Weather replanning failed:', error);
    } finally {
      setReplanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">Fetching trip itinerary details...</p>
        </div>
      </div>
    );
  }

  if (!trip || !itinerary) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Landmark className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Trip Workspace Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The trip link might be invalid or deleted.</p>
        <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Get active day keys e.g. ["day1", "day2"]
  const daysKeys = itinerary.days ? Array.from(new Map(Object.entries(itinerary.days)).keys()).sort() : [];
  
  // Safely parse selected day details
  const daySchedule = itinerary.days instanceof Map 
    ? itinerary.days.get(selectedDay) 
    : itinerary.days[selectedDay] || null;

  // Extract selected day activities for the map
  const activeActivities = daySchedule
    ? [daySchedule.morning, daySchedule.afternoon, daySchedule.evening].filter(Boolean)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 text-sm font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Hero Header */}
      <div className="glass-panel p-6 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-200/50 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-xs tracking-wider uppercase">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} /> Destination Route Workspace
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{trip.destination}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {trip.travelers} Traveler(s)
            </span>
            <span className="flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" />
              Total Budget: ₹{trip.budget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Live Weather Indicator */}
        {weather && (
          <div className="bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/30 rounded-2xl p-4 flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt={weather.condition}
                className="w-12 h-12"
              />
              <div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">{weather.temp}°C</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{weather.description}</p>
                <p className="text-[9px] text-violet-500 font-semibold mt-0.5">{selectedDay.replace('day', 'Day ')}</p>
              </div>
            </div>
            
            {/* Simulate Disruption Trigger */}
            <button
              onClick={() => handleSimulateWeather('Heavy Rain')}
              disabled={replanLoading}
              className="ml-4 px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/10 flex items-center gap-1.5 transition-all shrink-0"
              title="Simulate severe weather disruption to test automatic replanning"
            >
              {replanLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CloudRain className="w-3.5 h-3.5" />}
              Simulate Rain
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Itinerary Schedule Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
            {daysKeys.map((dayKey) => {
              const active = selectedDay === dayKey;
              const dayNum = dayKey.replace('day', '');
              return (
                <button
                  key={dayKey}
                  onClick={() => { setSelectedDay(dayKey); setExpandedSlot(null); }}
                  className={`px-5 py-3 rounded-2xl text-sm font-bold border transition-all whitespace-nowrap ${
                    active
                      ? 'bg-violet-600 border-violet-650 text-white shadow-md'
                      : 'bg-white dark:bg-darkbg-800 border-slate-200 dark:border-slate-700/50 text-slate-650 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Day {dayNum}
                </button>
              );
            })}
          </div>

          {/* Timeline slots */}
          {daySchedule ? (
            <div className="space-y-6 relative pl-4 sm:pl-6 border-l-2 border-slate-200/60 dark:border-slate-800 mt-4">
              
              {/* Morning Slot */}
              {daySchedule.morning && (
                <div className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-darkbg-900 bg-brand-500 shadow-md"></span>
                  
                  <div 
                    onClick={() => setExpandedSlot(expandedSlot === 'morning' ? null : 'morning')}
                    className="glass-panel p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-l-4 border-brand-500 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Morning Activity</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 font-semibold">
                        Cost: ₹{daySchedule.morning.cost || 0}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                      <Landmark className="w-4.5 h-4.5 text-brand-500 shrink-0" />
                      {daySchedule.morning.attraction}
                    </h3>
                    <p className="text-sm text-slate-550 dark:text-slate-400 mt-2 leading-relaxed">
                      {daySchedule.morning.activity}
                    </p>
                    
                    {expandedSlot === 'morning' && (
                      <div className="mt-3 p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-violet-100 dark:border-violet-900/30 animate-fade-in">
                        <p className="font-medium">📍 {daySchedule.morning.attraction} — A popular spot in {trip.destination} perfect for morning exploration. Enjoy the calm atmosphere and take in the local culture before the crowds arrive.</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 text-xs text-slate-450 dark:text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-brand-450 shrink-0" />
                        <span>Dining: <strong className="text-slate-700 dark:text-slate-350">{daySchedule.morning.food || 'Cafeteria suggestion'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-brand-450 shrink-0" />
                        <span>Transit: <strong className="text-slate-700 dark:text-slate-350">{daySchedule.morning.transport || 'Scooter/Cab'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Afternoon Slot */}
              {daySchedule.afternoon && (
                <div className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-darkbg-900 bg-accent-500 shadow-md"></span>
                  
                  <div 
                    onClick={() => setExpandedSlot(expandedSlot === 'afternoon' ? null : 'afternoon')}
                    className="glass-panel p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-l-4 border-accent-500 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wider">Afternoon Activity</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 font-semibold">
                        Cost: ₹{daySchedule.afternoon.cost || 0}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                      <Landmark className="w-4.5 h-4.5 text-teal-500 shrink-0" />
                      {daySchedule.afternoon.attraction}
                    </h3>
                    <p className="text-sm text-slate-550 dark:text-slate-400 mt-2 leading-relaxed">
                      {daySchedule.afternoon.activity}
                    </p>
                    
                    {expandedSlot === 'afternoon' && (
                      <div className="mt-3 p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-teal-100 dark:border-teal-900/30 animate-fade-in">
                        <p className="font-medium">📍 {daySchedule.afternoon.attraction} — An ideal afternoon destination in {trip.destination}. Great for immersive experiences with plenty of food and activity options nearby.</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 text-xs text-slate-450 dark:text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-teal-450 shrink-0" />
                        <span>Dining: <strong className="text-slate-700 dark:text-slate-350">{daySchedule.afternoon.food || 'Restaurant lunch'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-teal-450 shrink-0" />
                        <span>Transit: <strong className="text-slate-700 dark:text-slate-350">{daySchedule.afternoon.transport || 'Cab/Walk'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Evening Slot */}
              {daySchedule.evening && (
                <div className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[27px] sm:-left-[35px] top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-darkbg-900 bg-amber-500 shadow-md"></span>
                  
                  <div 
                    onClick={() => setExpandedSlot(expandedSlot === 'evening' ? null : 'evening')}
                    className="glass-panel p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md transition-all border-l-4 border-amber-500 cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Evening Activity</span>
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 font-semibold">
                        Cost: ₹{daySchedule.evening.cost || 0}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                      <Landmark className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                      {daySchedule.evening.attraction}
                    </h3>
                    <p className="text-sm text-slate-550 dark:text-slate-400 mt-2 leading-relaxed">
                      {daySchedule.evening.activity}
                    </p>
                    
                    {expandedSlot === 'evening' && (
                      <div className="mt-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-amber-100 dark:border-amber-900/30 animate-fade-in">
                        <p className="font-medium">📍 {daySchedule.evening.attraction} — Wind down your day at this evening hotspot in {trip.destination}. Perfect for relaxation, dining, and soaking in the local nightlife atmosphere.</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 text-xs text-slate-450 dark:text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Dining: <strong className="text-slate-700 dark:text-slate-350">{daySchedule.evening.food || 'Dinner suggestions'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Transit: <strong className="text-slate-700 dark:text-slate-350">{daySchedule.evening.transport || 'Local transport'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl text-center text-slate-450 dark:text-slate-500">
              No schedules mapped for this day.
            </div>
          )}

          {/* History tracker */}
          {itinerary.history && itinerary.history.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Re-route Change Audit Logs</h4>
              <div className="bg-slate-100/50 dark:bg-darkbg-800/40 border border-slate-200/20 rounded-2xl p-4 space-y-2 text-xs">
                {itinerary.history.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-500 dark:text-slate-400 leading-tight">
                    <span className="text-violet-500 shrink-0">•</span>
                    <div>
                      <strong>{new Date(log.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> - {log.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Maps, Assistant Chat */}
        <div className="space-y-6">
          
          {/* Map widget */}
          <div className="glass-panel p-4 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800 h-[380px] md:h-[480px]">
            <h3 className="text-sm font-bold text-slate-750 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-violet-500" /> Daily Map Routing Visuals
            </h3>
            <div className="w-full h-[calc(100%-2rem)]">
              <TravelMap activities={activeActivities} destination={trip.destination} />
            </div>
          </div>

          {/* AI Travel Assistant Chat Box */}
          <div className="glass-panel rounded-3xl flex flex-col h-[400px] border border-slate-200/50 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between bg-slate-55/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-violet-500" />
                <span className="font-bold text-sm text-slate-800 dark:text-white">AI Travel Assistant</span>
              </div>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" title="Assistant Stream Online"></span>
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-b border-slate-100 dark:border-slate-850 flex gap-1.5 overflow-x-auto shrink-0 bg-slate-50/50 dark:bg-slate-900/20">
              <button
                onClick={() => handleChatSubmit(null, 'Reduce budget by 30%')}
                disabled={chatLoading}
                className="text-[10px] px-2.5 py-1.5 bg-white dark:bg-darkbg-800 hover:bg-slate-55 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/40 dark:border-slate-700 text-slate-600 dark:text-slate-350 font-bold shrink-0"
              >
                💰 Cut Budget
              </button>
              <button
                onClick={() => handleChatSubmit(null, 'Add adventure and outdoor activities')}
                disabled={chatLoading}
                className="text-[10px] px-2.5 py-1.5 bg-white dark:bg-darkbg-800 hover:bg-slate-55 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/40 dark:border-slate-700 text-slate-600 dark:text-slate-350 font-bold shrink-0"
              >
                🏔️ Adventure
              </button>
              <button
                onClick={() => handleChatSubmit(null, 'Suggest the best local food and street food spots')}
                disabled={chatLoading}
                className="text-[10px] px-2.5 py-1.5 bg-white dark:bg-darkbg-800 hover:bg-slate-55 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/40 dark:border-slate-700 text-slate-600 dark:text-slate-350 font-bold shrink-0"
              >
                🍜 Local Food
              </button>
              <button
                onClick={() => handleChatSubmit(null, 'Remove all museums and replace with outdoor activities')}
                disabled={chatLoading}
                className="text-[10px] px-2.5 py-1.5 bg-white dark:bg-darkbg-800 hover:bg-slate-55 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/40 dark:border-slate-700 text-slate-600 dark:text-slate-350 font-bold shrink-0"
              >
                🚫 No Museums
              </button>
              <button
                onClick={() => handleChatSubmit(null, 'Show nearby attractions and hidden gems')}
                disabled={chatLoading}
                className="text-[10px] px-2.5 py-1.5 bg-white dark:bg-darkbg-800 hover:bg-slate-55 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200/40 dark:border-slate-700 text-slate-600 dark:text-slate-350 font-bold shrink-0"
              >
                📍 Nearby
              </button>
            </div>

            {/* Message Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5" role="log" aria-live="polite" aria-label="Chat conversation with AI assistant">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-205 rounded-tl-none border border-slate-200/20'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs border border-slate-200/20 text-slate-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input pane */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-100 dark:border-slate-850 flex gap-2 bg-slate-50/20">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask assistant to update plans..."
                disabled={chatLoading}
                aria-label="Type a message to the AI travel assistant"
                role="textbox"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1.5 focus:ring-violet-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-semibold disabled:opacity-50 transition-all flex items-center justify-center shadow-md shadow-violet-500/10"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
