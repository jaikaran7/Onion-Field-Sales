import type { GeoFailure, GeoFix } from "../types/domain.ts";

export function isAcceptableAccuracy(accuracy: number) {
  return Number.isFinite(accuracy) && accuracy > 0 && accuracy <= 30;
}

export function locationErrorMessage(code: GeoFailure) {
  if (code === "denied") {
    return "Location permission denied. Allow location access in your phone settings, then try again.";
  }
  if (code === "timeout") {
    return "Location timed out. Move to an open area and try again.";
  }
  if (code === "unsupported") {
    return "This phone cannot share its location in the browser.";
  }
  return "Location unavailable. Turn on location services and try again.";
}

export function getCurrentLocation() {
  if (!navigator.geolocation) {
    return Promise.reject(failure("unsupported"));
  }

  return new Promise<GeoFix>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) reject(failure("denied"));
        else if (error.code === error.TIMEOUT) reject(failure("timeout"));
        else reject(failure("unavailable"));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

function failure(code: GeoFailure) {
  return Object.assign(new Error(code), { code });
}

export function readGeoFailure(error: unknown): GeoFailure {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    if (code === "denied" || code === "unavailable" || code === "timeout" || code === "unsupported") {
      return code;
    }
  }
  return "unavailable";
}
