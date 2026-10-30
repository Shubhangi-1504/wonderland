import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CityEnvironment from './CityEnvironment';
import Roads from './Roads';
import PlazaFountain from './PlazaFountain';
import Buildings from './Buildings';
import Trees from './Trees';
import Vehicles from './Vehicles';
import Clouds from './Clouds';
import TechNovaExchange from '../Buildings/TechNovaExchange';
import GreenEnergy from '../Buildings/GreenEnergy';
import FoodSphere from '../Buildings/FoodSphere';
import CityCamera from '../Camera/CityCamera';
import StreetLights from './StreetLights';
import CitySignage from './CitySignage';
import Pedestrians from './Pedestrians';

export default function StockMarketCity({ selectedBuilding, onSelectBuilding, onResetTarget }) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{
          position: [38, 40, 52],
          fov: 38,
          near: 0.5,
          far: 250,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 2]} // Crisp rendering on high-DPI displays while staying performant
      >
        <color attach="background" args={['#030712']} />
        <fog attach="fog" args={['#030712', 65, 175]} />

        <Suspense fallback={null}>
          <CityCamera
            selectedBuilding={selectedBuilding}
            onResetTarget={onResetTarget}
          />
          <CityEnvironment />
          <Clouds />
          <Roads />
          <PlazaFountain position={[0, 0, 5]} />
          <Buildings />
          <Trees />
          <Vehicles />
          <StreetLights />
          <CitySignage />
          <Pedestrians />

          {/* Three Landmark Company Buildings */}
          <TechNovaExchange
            onSelect={onSelectBuilding}
            isSelected={selectedBuilding === 'technova'}
          />
          <GreenEnergy
            onSelect={onSelectBuilding}
            isSelected={selectedBuilding === 'greenenergy'}
          />
          <FoodSphere
            onSelect={onSelectBuilding}
            isSelected={selectedBuilding === 'foodsphere'}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
