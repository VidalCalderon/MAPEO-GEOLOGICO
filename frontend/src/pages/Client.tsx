import React from 'react';
import MapComponent from '../components/MapComponent';

const Client: React.FC = () => {
  return (
    <div className="w-full h-screen relative">
      <MapComponent />
      <div className="absolute bottom-4 right-4 z-20 bg-green-600 text-white px-4 py-2 rounded-full font-bold shadow text-sm">
        MODO CLIENTE
      </div>
    </div>
  );
};

export default Client;
