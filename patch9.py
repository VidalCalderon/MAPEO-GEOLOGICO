import re

with open('frontend/src/components/MapComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = 'export const BASEMAPS = ['
end_str = '];'

start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_basemaps = '''export const BASEMAPS = [
  { id: "osm", name: "OpenStreetMap", getSource: () => new OSM() },
  {
    id: "satellite",
    name: "Satélite (Esri)",
    getSource: () =>
      new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 23,
      }),
  },
  {
    id: "topo",
    name: "Topográfico (Esri)",
    getSource: () =>
      new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 23,
      }),
  },
  {
    id: "google-roadmap",
    name: "Google Callejero",
    getSource: () =>
      new XYZ({
        url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        maxZoom: 23,
      }),
  },
  {
    id: "google-satellite",
    name: "Google Satélite",
    getSource: () =>
      new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        maxZoom: 23,
      }),
  },
  {
    id: "google-hybrid",
    name: "Google Híbrido",
    getSource: () =>
      new XYZ({
        url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        maxZoom: 23,
      }),
  },
  {
    id: "google-terrain",
    name: "Google Terreno",
    getSource: () =>
      new XYZ({
        url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
        maxZoom: 23,
      }),
  }'''
    content = content[:start_idx] + new_basemaps + content[end_idx:]
    with open('frontend/src/components/MapComponent.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added basemaps")
else:
    print("Could not find BASEMAPS boundaries")
