import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Calendar, DollarSign, Users, Compass, ChevronRight, Check, MapPin, Train, Bus, Plane } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const TRAVEL_STYLES = ['Adventure', 'Relaxed', 'Culture', 'Luxury', 'Budget-Friendly'];
const PACES = ['Relaxed', 'Moderate', 'Fast'];
const INTERESTS_OPTIONS = ['Food', 'Beach', 'Nightlife', 'Shopping', 'Museums', 'Outdoors', 'History', 'Art'];

export default function TripForm() {
  const navigate = useNavigate();
  const { addLocalNotification } = useSocket();
  const [loading, setLoading] = useState(false);

  // Pre-fill destination from URL params (e.g., from trending section)
  const searchParams = new URLSearchParams(window.location.search);
  const prefillDestination = searchParams.get('destination') || '';

  const [formData, setFormData] = useState({
    destination: prefillDestination,
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    travelStyle: 'Adventure',
    interests: [],
    pace: 'Moderate',
    constraints: ''
  });

  // How to Reach state
  const [currentCity, setCurrentCity] = useState('');
  const [travelOptions, setTravelOptions] = useState(null);
  const [travelLoading, setTravelLoading] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState(null);

  const fetchTravelOptions = async () => {
    if (!currentCity || !formData.destination) return;
    setTravelLoading(true);
    try {
      const response = await axios.post('/api/trips/travel-options', {
        fromCity: currentCity,
        toCity: formData.destination,
        travelers: Number(formData.travelers) || 1
      });
      if (response.data.success) {
        setTravelOptions(response.data);
        setSelectedTransport(null);
      }
    } catch (error) {
      console.error('Error fetching travel options:', error);
    } finally {
      setTravelLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination || !formData.startDate || !formData.endDate || !formData.budget) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    setLoading(true);
    addLocalNotification(`Generating AI itinerary for ${formData.destination}... Please wait.`, 'general');

    try {
      const response = await axios.post('/api/trips', {
        ...formData,
        budget: Number(formData.budget),
        travelers: Number(formData.travelers)
      });

      if (response.data.success) {
        navigate(`/trips/${response.data.trip._id}`);
      }
    } catch (error) {
      console.error('Error generating trip:', error);
      alert(error.response?.data?.message || 'Itinerary generation failed. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-darkbg-900 transition-colors duration-300">
        <div className="text-center max-w-md p-8 glass-panel rounded-3xl shadow-xl animate-pulse-slow">
          <Compass className="w-16 h-16 text-violet-600 dark:text-violet-400 mx-auto mb-6 animate-spin" style={{ animationDuration: '4s' }} />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Consulting RoamAI Engine...</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            We are designing your customized day-by-day itinerary, finding coordinates for map routing, and checking regional weather patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          Design Your Adventure <Sparkles className="w-6 h-6 text-violet-500" />
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Provide your destinations, dates, and styles to generate an AI-customized weather-adaptive itinerary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 shadow-md border border-slate-200/50 dark:border-slate-800 space-y-6">
        
        {/* Destination */}
        <div>
          <label htmlFor="trip-destination" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Destination City</label>
          <input
            id="trip-destination"
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="e.g. Goa, Paris, Tokyo"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>

        {/* Budget & Travelers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Total Budget ($)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. 1500"
              required
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Number of Travelers</label>
            <input
              type="number"
              name="travelers"
              value={formData.travelers}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>

        {/* How to Reach Section */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-800/20">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" /> How to Reach — Travel Options
          </label>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                placeholder="Your current city (e.g. Delhi, Mumbai)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm"
              />
            </div>
            <button
              type="button"
              onClick={fetchTravelOptions}
              disabled={!currentCity || !formData.destination || travelLoading}
              className="px-5 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all shrink-0"
            >
              {travelLoading ? '...' : 'Check Routes'}
            </button>
          </div>

          {travelOptions && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {travelOptions.fromCity} → {travelOptions.toCity} • {travelOptions.distance} • {travelOptions.travelers} traveler(s)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {travelOptions.options.map((opt) => {
                  const isSelected = selectedTransport === opt.mode;
                  const budgetImpact = formData.budget ? Math.round((opt.totalCost / Number(formData.budget)) * 100) : null;
                  return (
                    <div
                      key={opt.mode}
                      onClick={() => setSelectedTransport(isSelected ? null : opt.mode)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{opt.icon}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{opt.duration}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">{opt.label}</h4>
                      <p className="text-lg font-bold text-violet-600 dark:text-violet-400 mt-1">
                        ₹{opt.totalCost.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{opt.comfort}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 italic mt-0.5">{opt.note}</p>
                      
                      {budgetImpact && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 dark:text-slate-400">Budget impact</span>
                            <span className={`text-[10px] font-bold ${budgetImpact > 40 ? 'text-rose-500' : budgetImpact > 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {budgetImpact}% of budget
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${budgetImpact > 40 ? 'bg-rose-500' : budgetImpact > 20 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(budgetImpact, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedTransport && formData.budget && (
                <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30 text-xs text-slate-600 dark:text-slate-300">
                  <strong>💡 Tip:</strong> With {travelOptions.options.find(o => o.mode === selectedTransport)?.label}, your remaining budget for the trip would be{' '}
                  <strong className="text-violet-600 dark:text-violet-400">
                    ₹{(Number(formData.budget) - travelOptions.options.find(o => o.mode === selectedTransport)?.totalCost).toLocaleString('en-IN')}
                  </strong>{' '}
                  for activities, food & stay.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Travel Style */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Travel Style</label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map(style => (
              <button
                type="button"
                key={style}
                onClick={() => setFormData(prev => ({ ...prev, travelStyle: style }))}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  formData.travelStyle === style
                    ? 'bg-violet-600 border-violet-650 text-white shadow-md'
                    : 'bg-white dark:bg-darkbg-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Interests & Hobbies (Select Multiple)</label>
          <div className="flex flex-wrap gap-2.5">
            {INTERESTS_OPTIONS.map(interest => {
              const active = formData.interests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-teal-600 border-teal-650 text-white shadow-md'
                      : 'bg-white dark:bg-darkbg-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pacing */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">Trip Pacing</label>
          <div className="grid grid-cols-3 gap-3">
            {PACES.map(p => (
              <button
                type="button"
                key={p}
                onClick={() => setFormData(prev => ({ ...prev, pace: p }))}
                className={`py-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                  formData.pace === p
                    ? 'bg-violet-600 border-violet-650 text-white shadow-md'
                    : 'bg-white dark:bg-darkbg-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Special Constraints & Notes (Optional)</label>
          <textarea
            name="constraints"
            value={formData.constraints}
            onChange={handleChange}
            rows="3"
            placeholder="e.g. Dietary limits (vegetarian/halal), mobility limits (wheelchair friendly), no museums..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-darkbg-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-teal-500 hover:from-violet-700 hover:to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          Consult RoamAI Assistant <ChevronRight className="w-5 h-5" />
        </button>

      </form>
    </div>
  );
}
