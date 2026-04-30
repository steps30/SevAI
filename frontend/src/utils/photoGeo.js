function getPhotoGeoSourceLabel(source, labels) {
  if (source === "photo-exif") {
    return labels.photoExif;
  }

  if (source === "device-geolocation") {
    return labels.deviceLocation;
  }

  return labels.unknown;
}

function buildPhotoGeoMapUrl(photoGeo) {
  // Ensure we have valid coordinates before building the URL
  if (!photoGeo?.latitude || !photoGeo?.longitude) {
    return "";
  }

  // FIXED: Standard, official Google Maps deep-link format
  return `https://maps.google.com/?q=${photoGeo.latitude},${photoGeo.longitude}`;
}

function hasPhotoGeo(photoGeo) {
  return typeof photoGeo?.latitude === "number" && typeof photoGeo?.longitude === "number";
}

export { buildPhotoGeoMapUrl, getPhotoGeoSourceLabel, hasPhotoGeo };