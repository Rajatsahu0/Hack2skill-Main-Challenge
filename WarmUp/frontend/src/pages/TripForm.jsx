import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Calendar, DollarSign, Users, Compass, ChevronRight, Check } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const TRAVEL_STYLES = ['Adventure', 'Relaxed', 'Culture', 'Luxury', 'Budget-Friendly'];
const PACES = ['Relaxed', 'Moderate', 'Fast'];
const INTERESTS_OPTIONS = ['Food', 'Beach', 'Nightlife', 'Shopping', 'Museums', 'Outdoors', 'History', 'Art'];

export default function TripForm() {
  const navigate = useNavigate();
  const { addLocalNotification } = useSocket();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelers: 1,
    travelStyle: 'Adventure',
    interests: [],
    pace: 'Moderate',
    constraints: ''
  });

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
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Destination City</label>
          <input
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
