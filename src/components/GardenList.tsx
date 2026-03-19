import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export default function GardenList() {
  const { myPlants, selectedPlant, setSelectedPlant } = useAppStore();

  if (myPlants.length === 0) return null;

  return (
    <div className="w-full px-1">
      <h3 className="text-xs font-medium text-muted-foreground mb-3">
        나의 정원 ({myPlants.length})
      </h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
        {myPlants.map((plant) => {
          const isSelected = selectedPlant?.id === plant.id;
          return (
            <motion.button
              key={plant.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPlant(plant)}
              className={`snap-start shrink-0 cursor-pointer flex flex-col items-center gap-2 transition-all duration-300 ${
                isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-80'
              }`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-all ${
                isSelected ? 'ring-2 ring-lime glow-lime' : ''
              }`} style={{ background: 'rgba(255,255,255,0.08)' }}>
                {plant.img_url ? (
                  <img src={plant.img_url} alt={plant.nickname} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🌿</span>
                )}
              </div>
              <span className="text-[11px] text-foreground/80 max-w-[60px] truncate">
                {plant.nickname || plant.plant_name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
