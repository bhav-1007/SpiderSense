import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { socket } from './SocketContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:4000/api`;
const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [units, setUnits] = useState([]);
  const [aiAutoDispatchEnabled, setAiAutoDispatchEnabledState] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('spidersense_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user.role === 'dispatcher') user.role = 'commander';
      return user;
    }
    return null;
  });
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  useEffect(() => {
    // Initial fetch via REST API
    axios.get(`${API_BASE}/state`)
      .then((res) => {
        setIncidents(res.data.incidents || []);
        setUnits(res.data.units || []);
      })
      .catch(console.error);

    axios.get(`${API_BASE}/settings`)
      .then((res) => setAiAutoDispatchEnabledState(res.data.aiAutoDispatchEnabled))
      .catch(console.error);

    socket.on('sync:state', (state) => {
      setIncidents(state.incidents || []);
      setUnits(state.units || []);
    });

    socket.on('settings:ai-auto-dispatch', (data) => {
      setAiAutoDispatchEnabledState(data.enabled);
    });

    socket.on('incident:created', (newInc) => {
      setIncidents(prev => {
        if (prev.some(i => i.id === newInc.id)) return prev;
        return [newInc, ...prev];
      });
    });

    socket.on('incident:updated', (updatedInc) => {
      setIncidents(prev => prev.map(inc => inc.id === updatedInc.id ? updatedInc : inc));
    });

    socket.on('unit:updated', (updatedUnit) => {
      setUnits(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
    });

    socket.on('unit:updated_many', (updatedUnits) => {
      setUnits(updatedUnits);
    });

    return () => {
      socket.off('sync:state');
      socket.off('settings:ai-auto-dispatch');
      socket.off('incident:created');
      socket.off('incident:updated');
      socket.off('unit:updated');
      socket.off('unit:updated_many');
    };
  }, []);

  const login = (role) => {
    let user = { id: 'u-' + Date.now(), name: role === 'citizen' ? 'Citizen' : role === 'commander' ? 'Commander' : 'Hero', role };
    if (role === 'responder') {
      // Bind to a fixed unit (e.g. Iron Man) for demo credibility instead of letting them pick from a dropdown
      user.unitId = 'h-2'; 
      user.name = 'Tony Stark';
    }
    setCurrentUser(user);
    localStorage.setItem('spidersense_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('spidersense_user');
  };

  const reportIncident = useCallback(async (draft) => {
    try {
      const res = await axios.post(`${API_BASE}/incidents`, draft);
      return res.data.id;
    } catch (error) {
      console.error('Failed to report incident', error);
      throw error;
    }
  }, []);

  const updateIncidentStatus = useCallback(async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/incidents/${id}/status`, { status });
    } catch (error) {
      console.error('Failed to update incident', error);
    }
  }, []);

  const assignUnits = useCallback(async (incidentId, unitIds, opts = {}) => {
    try {
      await axios.patch(`${API_BASE}/incidents/${incidentId}/assign`, { unitIds, ...opts });
    } catch (error) {
      console.error('Failed to assign units', error);
    }
  }, []);

  const setUnitStatus = useCallback(async (unitId, status) => {
    try {
      await axios.patch(`${API_BASE}/units/${unitId}/status`, { status });
    } catch (error) {
      console.error('Failed to set unit status', error);
    }
  }, []);

  const loginHero = useCallback(async (username, password) => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      const hero = res.data;
      const user = { id: `u-${Date.now()}`, name: hero.name, role: 'responder', unitId: hero.id };
      setCurrentUser(user);
      localStorage.setItem('spidersense_user', JSON.stringify(user));
      return hero;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }, []);

  const createHero = useCallback(async (draft) => {
    try {
      const res = await axios.post(`${API_BASE}/heroes`, draft);
      return res.data;
    } catch (error) {
      console.error('Failed to create hero', error);
      throw error;
    }
  }, []);

  const setAiAutoDispatchEnabled = useCallback(async (enabled) => {
    try {
      await axios.patch(`${API_BASE}/settings/ai-auto-dispatch`, { enabled });
    } catch (error) {
      console.error('Failed to set AI dispatch', error);
    }
  }, []);

  const stats = {
    total: incidents.length,
    critical: incidents.filter((i) => i.severity === 'critical').length,
    active: incidents.filter((i) => i.status !== 'resolved').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
  };

  return (
    <StoreContext.Provider value={{
      incidents, setIncidents,
      units, setUnits,
      aiAutoDispatchEnabled, setAiAutoDispatchEnabled,
      currentUser, login, logout, loginHero, createHero,
      selectedIncidentId, setSelectedIncidentId,
      reportIncident, updateIncidentStatus, assignUnits, setUnitStatus,
      stats, apiBase: API_BASE
    }}>
      {children}
    </StoreContext.Provider>
  );
}
