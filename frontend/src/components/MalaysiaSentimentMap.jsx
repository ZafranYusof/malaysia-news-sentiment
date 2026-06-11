import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MalaysiaSentimentMap = ({ data = [], loading = false }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors © CARTO'
          }
        },
        layers: [
          {
            id: 'carto-dark-layer',
            type: 'raster',
            source: 'carto-dark',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [109.5, 4.2], // Center of Malaysia
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 10
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Load GeoJSON
    fetch('/malaysia-states.geojson')
      .then(res => res.json())
      .then(geojson => {
        // Add source if not exists
        if (!map.current.getSource('malaysia-states')) {
          map.current.addSource('malaysia-states', {
            type: 'geojson',
            data: geojson
          });
        }

        // Create sentiment lookup from data
        const sentimentLookup = {};
        data.forEach(item => {
          sentimentLookup[item.state] = {
            positive: item.positive || 0,
            negative: item.negative || 0,
            neutral: item.neutral || 0,
            total: item.count || 0,
            avgScore: item.avgScore || 0
          };
        });

        // Update GeoJSON features with sentiment data
        geojson.features.forEach(feature => {
          const stateName = feature.properties.name;
          const sentiment = sentimentLookup[stateName] || {
            positive: 0,
            negative: 0,
            neutral: 0,
            total: 0,
            avgScore: 0
          };
          
          feature.properties.positive = sentiment.positive;
          feature.properties.negative = sentiment.negative;
          feature.properties.neutral = sentiment.neutral;
          feature.properties.total = sentiment.total;
          feature.properties.avgScore = sentiment.avgScore;
        });

        // Update source data
        if (map.current.getSource('malaysia-states')) {
          map.current.getSource('malaysia-states').setData(geojson);
        }

        // Add fill layer if not exists
        if (!map.current.getLayer('states-fill')) {
          map.current.addLayer({
            id: 'states-fill',
            type: 'fill',
            source: 'malaysia-states',
            paint: {
              'fill-color': [
                'case',
                ['>', ['get', 'avgScore'], 0.6], '#10b981', // Green (Positive)
                ['>', ['get', 'avgScore'], 0.4], '#fbbf24', // Yellow (Neutral)
                '#ef4444' // Red (Negative)
              ],
              'fill-opacity': [
                'case',
                ['==', ['get', 'total'], 0], 0.1, // Low opacity for no data
                0.6
              ]
            }
          });
        }

        // Add border layer if not exists
        if (!map.current.getLayer('states-border')) {
          map.current.addLayer({
            id: 'states-border',
            type: 'line',
            source: 'malaysia-states',
            paint: {
              'line-color': '#94a3b8',
              'line-width': 1.5
            }
          });
        }

        // Add hover effect
        map.current.on('mousemove', 'states-fill', (e) => {
          if (e.features.length > 0) {
            map.current.getCanvas().style.cursor = 'pointer';
            
            const feature = e.features[0];
            const { name, positive, negative, neutral, total } = feature.properties;
            
            // Create popup
            const popup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="p-2 min-w-[160px]">
                  <div class="font-bold text-sm mb-2">${name}</div>
                  <div class="text-xs space-y-1">
                    <div class="flex justify-between">
                      <span class="text-emerald-500">● Positive:</span>
                      <span class="font-semibold">${positive}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-red-500">● Negative:</span>
                      <span class="font-semibold">${negative}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-amber-500">● Neutral:</span>
                      <span class="font-semibold">${neutral}</span>
                    </div>
                    <div class="flex justify-between border-t border-gray-700 pt-1 mt-1">
                      <span>Total:</span>
                      <span class="font-bold">${total}</span>
                    </div>
                  </div>
                </div>
              `)
              .addTo(map.current);
            
            // Store popup reference to remove on mouseleave
            map.current._currentPopup = popup;
          }
        });

        map.current.on('mouseleave', 'states-fill', () => {
          map.current.getCanvas().style.cursor = '';
          if (map.current._currentPopup) {
            map.current._currentPopup.remove();
            map.current._currentPopup = null;
          }
        });

        // Click handler for state filtering (optional)
        map.current.on('click', 'states-fill', (e) => {
          if (e.features.length > 0) {
            const stateName = e.features[0].properties.name;
            console.log('Clicked state:', stateName);
            // TODO: Emit event to parent component for filtering
          }
        });
      });
  }, [mapLoaded, data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Regional Sentiment Map
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          Interactive
        </span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Sentiment:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-400"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Negative</span>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      />
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
        Hover over states to see details • Click to filter
      </div>
    </div>
  );
};

export default MalaysiaSentimentMap;
