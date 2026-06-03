'use client';

const STORAGE_SESSION = 'ps_session_v1';

export function readStorage(key, fallback) {
	if (typeof window === 'undefined') return fallback;
	try {
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : fallback;
	} catch (e) {
		return fallback;
	}
}

export function writeStorage(key, value) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(key, JSON.stringify(value));
}

export function getSession() {
	return readStorage(STORAGE_SESSION, null);
}

export function setSession(sessionData) {
	writeStorage(STORAGE_SESSION, sessionData);
	// Dispara evento global para sincronizar abas e componentes
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new Event('session-changed'));
	}
}

export function clearSession() {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(STORAGE_SESSION);
		window.dispatchEvent(new Event('session-changed'));
	}
}
