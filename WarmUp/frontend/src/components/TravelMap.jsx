import React, { useEffect, useRef } from 'react';

export default function TravelMap({ activities, destination }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  useEffect(() => {
    // Ensure Leaflet is loaded from standard script CDN in index.html
    if (!window.L || !mapContainerRef.current) return;

    // Safely remove active instances
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Parse coordinates from activities
    const coordinates = [];
    activities.forEach(act => {
      if (act?.location?.lat && act?.location?.lng) {
        coordinates.push([act.location.lat, act.location.lng]);
      }
    });

    // Default center coords
    let center = [15.4909, 73.8278]; // Default: Goa
    if (coordinates.length > 0) {
      center = coordinates[0];
    }

    // 1. Create Map Context
    const map = window.L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView(center, 13);
    mapRef.current = map;

    // 2. Add OpenStreetMap tile configurations
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. Construct visual markers
    const pointColors = ['#8b5cf6', '#14b8a6', '#f59e0b']; // Violet, Teal, Amber
    const labels = ['M', 'A', 'E'];
    const titles = ['Morning Activity', 'Afternoon Activity', 'Evening Activity'];

    activities.forEach((act, idx) => {
      if (act?.location?.lat && act?.location?.lng) {
        const markerPos = [act.location.lat, act.location.lng];
        
        const htmlBubble = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shadow-md text-white font-bold text-xs" 
               style="background-color: ${pointColors[idx]};">
            ${labels[idx]}
          </div>
        `;

        const customIcon = window.L.divIcon({
          html: htmlBubble,
          className: 'leaflet-custom-marker-div',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        const popupTemplate = `
          <div style="font-family: sans-serif; padding: 4px; width: 160px;">
            <strong style="color: ${pointColors[idx]}; font-size: 11px; text-transform: uppercase;">${titles[idx]}</strong>
            <h5 style="margin: 3px 0 1px 0; font-weight: bold; color: #1e293b;">${act.attraction}</h5>
            <p style="margin: 0; font-size: 10px; color: #64748b; line-height: 1.3;">${act.activity.substring(0, 45)}...</p>
          </div>
        `;

        const marker = window.L.marker(markerPos, { icon: customIcon })
          .addTo(map)
          .bindPopup(popupTemplate);
          
        markersRef.current.push(marker);
      }
    });

    // 4. Draw route connection line (dashed styling)
    if (coordinates.length > 1) {
      const polyline = window.L.polyline(coordinates, {
        color: '#8b5cf6',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '6, 8'
      }).addTo(map);
      
      polylineRef.current = polyline;

      // Adjust zoom box boundary
      map.fitBounds(window.L.latLngBounds(coordinates), { padding: [55, 55] });
    } else if (coordinates.length === 1) {
      map.setView(coordinates[0], 14);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activities]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px] md:min-h-[450px]" />
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-darkbg-800/90 backdrop-blur-md px-3.5 py-3 rounded-2xl shadow-lg border border-slate-200/40 dark:border-slate-700/50 z-[1000] text-[10px] space-y-2 font-bold text-slate-600 dark:text-slate-350">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Morning (M)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-500"></span> Afternoon (A)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Evening (E)
        </div>
      </div>
    </div>
  );
}
