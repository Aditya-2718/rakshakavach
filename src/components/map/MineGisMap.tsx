import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SensorNode, SectorPrediction } from '../../types';
import { useMine } from '../../context/MineContext';
import { Layers, Eye, Compass } from 'lucide-react';

interface MineGisMapProps {
  sensors: SensorNode[];
  predictions?: SectorPrediction[];
  onSelectSensor?: (sensor: SensorNode) => void;
  height?: string | number;
}

export const MineGisMap: React.FC<MineGisMapProps> = ({
  sensors,
  predictions: _predictions = [],
  onSelectSensor,
  height = 560
}) => {
  const { selectedMine } = useMine();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<'dark' | 'satellite' | 'terrain'>('dark');
  const [showHeatZones, setShowHeatZones] = useState<boolean>(true);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);

  const tileLayers: Record<string, string> = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedMine.latitude, selectedMine.longitude],
        zoom: 15,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add default dark tile layer
      L.tileLayer(tileLayers[activeLayer], {
        attribution: '&copy; OpenStreetMap &copy; CARTO / Esri',
        maxZoom: 19
      }).addTo(map);

      // Create layer groups
      const markersGroup = L.layerGroup().addTo(map);
      const zonesGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersGroup;
      zonesLayerRef.current = zonesGroup;
    } else {
      mapInstanceRef.current.setView([selectedMine.latitude, selectedMine.longitude], 15);
    }
  }, [selectedMine.id]);

  // Update base tiles when activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileLayers[activeLayer], {
      attribution: '&copy; CartoDB &copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map);
  }, [activeLayer]);

  // Draw zones and markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !zonesLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    const zonesGroup = zonesLayerRef.current;

    markersGroup.clearLayers();
    zonesGroup.clearLayers();

    // 1. Draw Subsidence Risk Contours & Excavation Zones
    if (showHeatZones) {
      // High Risk Zone polygon (Panel 4B Goaf & Subsidence Trough)
      const criticalZonePolygon = L.polygon(
        [
          [selectedMine.latitude + 0.003, selectedMine.longitude - 0.003],
          [selectedMine.latitude + 0.004, selectedMine.longitude + 0.002],
          [selectedMine.latitude + 0.001, selectedMine.longitude + 0.004],
          [selectedMine.latitude - 0.002, selectedMine.longitude - 0.001]
        ],
        {
          color: '#ef4444',
          weight: 2,
          dashArray: '4, 4',
          fillColor: '#ef4444',
          fillOpacity: 0.22
        }
      ).bindTooltip('High Subsidence Trough Risk (Panel 4B Depillaring Face)', {
        permanent: false,
        direction: 'top',
        className: 'mg-map-tooltip'
      });
      zonesGroup.addLayer(criticalZonePolygon);

      // Warning Zone polygon (Highway Corridor Protection Margin)
      const warningZonePolygon = L.polygon(
        [
          [selectedMine.latitude + 0.005, selectedMine.longitude + 0.001],
          [selectedMine.latitude + 0.006, selectedMine.longitude + 0.006],
          [selectedMine.latitude + 0.003, selectedMine.longitude + 0.007],
          [selectedMine.latitude + 0.002, selectedMine.longitude + 0.002]
        ],
        {
          color: '#f97316',
          weight: 1.5,
          dashArray: '3, 3',
          fillColor: '#f97316',
          fillOpacity: 0.15
        }
      ).bindTooltip('Surface Infrastructure Buffer: PWD Corridor', {
        permanent: false,
        direction: 'top'
      });
      zonesGroup.addLayer(warningZonePolygon);

      // Stable Barrier Pillar
      const stableZoneCircle = L.circle([selectedMine.latitude - 0.003, selectedMine.longitude + 0.001], {
        radius: 260,
        color: '#10b981',
        weight: 1,
        fillColor: '#10b981',
        fillOpacity: 0.1
      }).bindTooltip('Stable Boundary Barrier Zone', { permanent: false });
      zonesGroup.addLayer(stableZoneCircle);
    }

    // 2. Add Sensor Markers with custom HTML/SVG DivIcons
    sensors.forEach((sensor) => {
      const getPinColor = (status: string) => {
        switch (status) {
          case 'critical':
            return '#ef4444';
          case 'warning':
            return '#f97316';
          case 'moderate':
            return '#f59e0b';
          default:
            return '#06b6d4';
        }
      };

      const pinColor = getPinColor(sensor.status);
      const isCritical = sensor.status === 'critical';

      const customIcon = L.divIcon({
        className: 'custom-sensor-marker',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            ${
              isCritical
                ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: ${pinColor}; opacity: 0.4; animation: ping-radar 1.5s infinite;"></div>`
                : ''
            }
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #0b1329; border: 2.5px solid ${pinColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${pinColor};">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${pinColor};"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([sensor.coordinates.lat, sensor.coordinates.lng], { icon: customIcon });

      const popupHtml = `
        <div style="min-width: 210px; font-family: var(--font-sans);">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="color: #ffffff; font-size: 0.88rem;">${sensor.name}</strong>
            <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 99px; background: ${pinColor}22; color: ${pinColor}; font-weight: 700; text-transform: uppercase;">${sensor.status}</span>
          </div>
          <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 4px 0;"><strong>Sector:</strong> ${sensor.sector}</p>
          <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 4px 0;"><strong>Type:</strong> ${sensor.type}</p>
          <p style="font-size: 0.78rem; color: #94a3b8; margin: 0 0 8px 0;"><strong>Depth:</strong> ${sensor.depthMeters} m | Elev: ${sensor.coordinates.elevationMeters}m</p>
          <div style="background: rgba(255,255,255,0.05); padding: 6px 8px; border-radius: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem;">
            <div>Disp: <strong style="color: #ffffff;">${sensor.metrics.displacementMm} mm</strong></div>
            <div>Tilt: <strong style="color: #ffffff;">${sensor.metrics.tiltMmPerM} mm/m</strong></div>
            <div>Subsidence: <strong style="color: #ffffff;">${sensor.metrics.subsidenceVelocityMmDay} mm/d</strong></div>
            <div>Vibr: <strong style="color: #ffffff;">${sensor.metrics.vibrationMmS} mm/s</strong></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedSensorId(sensor.id);
        if (onSelectSensor) onSelectSensor(sensor);
      });

      markersGroup.addLayer(marker);
    });
  }, [sensors, showHeatZones, selectedMine.id]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Top Map Action Bar */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1000,
          background: 'rgba(10, 16, 31, 0.88)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '0.4rem 0.6rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={13} /> Layer:
        </span>
        {(['dark', 'satellite', 'terrain'] as const).map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`mg-btn mg-btn-sm ${activeLayer === layer ? 'mg-btn-outline-cyan' : 'mg-btn-secondary'}`}
            style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
          >
            {layer}
          </button>
        ))}

        <div style={{ height: 16, width: 1, background: 'var(--border-subtle)', margin: '0 4px' }} />

        <button
          onClick={() => setShowHeatZones(!showHeatZones)}
          className={`mg-btn mg-btn-sm ${showHeatZones ? 'mg-btn-outline-cyan' : 'mg-btn-secondary'}`}
          style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem' }}
        >
          <Eye size={12} /> {showHeatZones ? 'Subsidence Contours: ON' : 'Subsidence Contours: OFF'}
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1000,
          background: 'rgba(10, 16, 31, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.78rem',
          color: 'var(--text-main)',
          maxWidth: 280
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Compass size={14} color="var(--cyan-bright)" />
          <span>GIS Subsidence Map Legend</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span>Critical Anomaly / High Strain Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }} />
            <span>Warning / Accelerating Slope</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4' }} />
            <span>Nominal Elastic Reading Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
            <span style={{ width: 14, height: 8, background: '#ef444433', border: '1px dashed #ef4444' }} />
            <span>Subsidence Trough Predicted Zone</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem', paddingTop: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <div>Coordinates: {selectedMine.latitude.toFixed(4)}°N, {selectedMine.longitude.toFixed(4)}°E</div>
          {selectedSensorId && (
            <div style={{ color: 'var(--cyan-bright)', marginTop: '2px' }}>
              Selected Node: <strong>{selectedSensorId}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
