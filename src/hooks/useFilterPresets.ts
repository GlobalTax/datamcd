import { useState, useEffect } from 'react';
import { FilterPreset, AdvancedIncidentFilters } from '@/types/advancedFilters';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export const useFilterPresets = () => {
  const [savedPresets, setSavedPresets] = useLocalStorage<FilterPreset[]>('incident-filter-presets', []);
  const [currentPreset, setCurrentPreset] = useState<FilterPreset | null>(null);

  const savePreset = (name: string, filters: AdvancedIncidentFilters) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: { ...filters, filterName: name, isSaved: true },
      createdAt: new Date(),
    };

    setSavedPresets(prev => [...prev, newPreset]);
    setCurrentPreset(newPreset);
    return newPreset;
  };

  const deletePreset = (id: string) => {
    setSavedPresets(prev => prev.filter(preset => preset.id !== id));
    if (currentPreset?.id === id) {
      setCurrentPreset(null);
    }
  };

  const loadPreset = (preset: FilterPreset) => {
    setCurrentPreset(preset);
    return preset.filters;
  };

  const updatePreset = (id: string, updatedFilters: AdvancedIncidentFilters) => {
    setSavedPresets(prev => 
      prev.map(preset => 
        preset.id === id 
          ? { ...preset, filters: updatedFilters }
          : preset
      )
    );
  };

  const clearCurrentPreset = () => {
    setCurrentPreset(null);
  };

  return {
    savedPresets,
    currentPreset,
    savePreset,
    deletePreset,
    loadPreset,
    updatePreset,
    clearCurrentPreset
  };
};