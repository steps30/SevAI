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
  if (!photoGeo?.latitude || !photoGeo?.longitude) {
    return "";
  }

  return `https://www.google.com/maps?q=${photoGeo.latitude},${photoGeo.longitude}`;
}

function hasPhotoGeo(photoGeo) {
  return typeof photoGeo?.latitude === "number" && typeof photoGeo?.longitude === "number";
}

export { buildPhotoGeoMapUrl, getPhotoGeoSourceLabel, hasPhotoGeo };