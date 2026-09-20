import React from 'react';
import MapComponent from '../components/MapComponent';

const Client: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <MapComponent mode="client" />
    </div>
  );
};

export default Client;
