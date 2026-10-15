import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { socket } from './SocketContext';

// In production, the frontend and backend are served from the same origin.
// In development, Vite runs on 5173 and the backend runs on 4000.
const API_BASE = import.meta.env.PROD
  ? '/api'
  : `http://${window.location.hostname}:4000/api`;

const StoreContext = createContext();

export function useStore() {
  return useContext(StoreContext);
}

export function StoreProvider({ children }) {
  const [incidents, setIncidents]                       = useState([]);
  const [units, setUnits]                               = useState([]);
  const [aiAutoDispatchEnabled, setAiAutoDispatchState] = useState(true);

  // Persist logged-in user across page refreshes
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spidersense_user');
      if (!saved) return null;
      const user = JSON.parse(saved);
      // Migrate old 'dispatcher' role name → 'commander'
      if (user.role === 'dispatcher') user.role = 'commander';
      return user;
    } catch {
      return null;
    }
  });

  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  // ── Initial data fetch + Socket.io event listeners ────────────────────────
  useEffect(() => {
    // Fetch all data on mount
    axios.get(`${API_BASE}/state`)
      .then((res) => {
        setIncidents(res.data.incidents || []);
        setUnits(res.data.units || []);
      })
      .catch(console.error);

    axios.get(`${API_BASE}/settings`)
      .then((res) => setAiAutoDispatchState(res.data.aiAutoDispatchEnabled))
      .catch(console.error);

    // Real-time updates from the server
    socket.on('sync:state', (state) => {
      setIncidents(state.incidents || []);
      setUnits(state.units || []);
    });

    socket.on('settings:ai-auto-dispatch', (data) => {
      setAiAutoDispatchState(data.enabled);
    });

    socket.on('incident:created', (newInc) => {
      setIncidents((prev) => {
        // Avoid duplicates in case a sync:state also arrives
        if (prev.some((i) => i.id === newInc.id)) return prev;
        return [newInc, ...prev];
      });
    });

    socket.on('incident:updated', (updatedInc) => {
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === updatedInc.id ? updatedInc : inc))
      );
    });

    socket.on('unit:updated', (updatedUnit) => {
      setUnits((prev) =>
        prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u))
      );
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

  // ── Auth helpers ─────────────────────────────────────────────────────────

  /** Quick login for Commander and Citizen roles (no server call needed) */
  const login = (role) => {
    const user = {
      id:   `u-${Date.now()}`,
      name: role === 'citizen' ? 'Citizen' : role === 'commander' ? 'Commander' : 'Hero',
      role,
    };
    setCurrentUser(user);
    localStorage.setItem('spidersense_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('spidersense_user');
  };

  /** Hero login — authenticates against the backend and binds the unit */
  const loginHero = useCallback(async (heroId) => {
    const res  = await axios.post(`${API_BASE}/login`, { id: heroId });
    const hero = res.data;
    const user = {
      id:     `u-${Date.now()}`,
      name:   hero.callSign || hero.name,
      role:   'responder',
      unitId: hero.id,
    };
    setCurrentUser(user);
    localStorage.setItem('spidersense_user', JSON.stringify(user));
    return hero;
  }, []);

  /** Register a new hero/responder unit */
  const createHero = useCallback(async (draft) => {
    const res = await axios.post(`${API_BASE}/heroes`, draft);
    return res.data;
  }, []);

  // ── Incident actions ──────────────────────────────────────────────────────

  const reportIncident = useCallback(async (draft) => {
    const res = await axios.post(`${API_BASE}/incidents`, draft);
    return res.data.id;
  }, []);

  const updateIncidentStatus = useCallback(async (id, status) => {
    await axios.patch(`${API_BASE}/incidents/${id}/status`, { status });
  }, []);

  const assignUnits = useCallback(async (incidentId, unitIds, opts = {}) => {
    await axios.patch(`${API_BASE}/incidents/${incidentId}/assign`, {
      unitIds,
      ...opts,
    });
  }, []);

  // ── Unit actions ──────────────────────────────────────────────────────────

  const setUnitStatus = useCallback(async (unitId, statusOrUpdate) => {
    // Accepts either a string ("dispatched") or an object ({ isActive: false })
    const body = typeof statusOrUpdate === 'string'
      ? { status: statusOrUpdate }
      : statusOrUpdate;
    await axios.patch(`${API_BASE}/units/${unitId}/status`, body);
  }, []);

  // ── AI dispatch toggle ────────────────────────────────────────────────────

  const setAiAutoDispatchEnabled = useCallback(async (enabled) => {
    await axios.patch(`${API_BASE}/settings/ai-auto-dispatch`, { enabled });
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = {
    total:    incidents.length,
    critical: incidents.filter((i) => i.severity === 'critical').length,
    active:   incidents.filter((i) => i.status !== 'resolved').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
  };

  return (
    <StoreContext.Provider
      value={{
        incidents, setIncidents,
        units,     setUnits,
        aiAutoDispatchEnabled, setAiAutoDispatchEnabled,
        currentUser, login, logout, loginHero, createHero,
        selectedIncidentId, setSelectedIncidentId,
        reportIncident, updateIncidentStatus, assignUnits, setUnitStatus,
        stats,
        apiBase: API_BASE,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
