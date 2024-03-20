import geohash from 'ngeohash';

export type Coordinates = [number, number];

export class PathArea {
  private areaSq = 22.7529; // 4.77m x 4.77m
  private precision = 9;
  private spacing = 3; // meters

  /**
   * Calculates the distance between two points (in meters) using the Haversine formula
   * @param start [longitude, latitude]
   * @param end [longitude, latitude]
   * @returns distance in meters
   */
  public distance(start: Coordinates, end: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (start[1] * Math.PI) / 180; // Convert degrees to radians
    const φ2 = (end[1] * Math.PI) / 180;
    const Δφ = ((end[1] - start[1]) * Math.PI) / 180;
    const Δλ = ((end[0] - start[0]) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Interpolate coordinates between two
   * @param start [longitude, latitude]
   * @param end [longitude, latitude]
   * @returns coordinates including start but no end
   */
  private interpolatePath(start: Coordinates, end: Coordinates): Coordinates[] {
    const coordinates: Coordinates[] = [];

    // if start & end are the same, no need to interpolate
    if (start[1] === end[1] && start[0] === end[0]) {
      return [start, end];
    }

    const totalDistance = this.distance(start, end);
    const numPoints = Math.ceil(totalDistance / this.spacing); // include start but exclude end points

    const latDiff = end[1] - start[1];
    const lngDiff = end[0] - start[0];

    const stepLat = latDiff / (numPoints - 1);
    const stepLng = lngDiff / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const lat = start[1] + i * stepLat;
      const lng = start[0] + i * stepLng;

      coordinates.push([lng, lat]);
    }

    return coordinates;
  }

  /**
   * Get interpolated path
   * @param coordinates [longitude, latitude][]
   * @returns [longitude, latitude][]
   */
  public coordinates(coordinates: Coordinates[]): Coordinates[] {
    let pathCoordinates: Coordinates[] = [];

    for (let i = 0; i < coordinates.length - 1; i++) {
      const path = this.interpolatePath(coordinates[i], coordinates[i + 1]);
      pathCoordinates = [...pathCoordinates, ...path];
    }

    // add the last coordinate missing from loop
    const last = coordinates[coordinates.length - 1];
    pathCoordinates.push(last);

    return pathCoordinates;
  }

  /**
   *
   * @param coordinates [longitude, latitude][]
   * @returns geohash[]
   */
  public geohashes(coordinates: Coordinates[]): Set<string> {
    const output = new Set<string>();

    this.coordinates(coordinates).forEach((coordinate) => {
      output.add(geohash.encode(coordinate[1], coordinate[0], this.precision));
    });

    return output;
  }

  public computeArea(geohashes: Set<string>): number {
    return geohashes.size * this.areaSq;
  }

  /**
   *
   * @param coordinates [longitude, latitude]
   * @returns m²
   */
  public area(coordinates: Coordinates[]): number {
    const geohashes = this.geohashes(coordinates);
    return this.computeArea(geohashes);
  }
}
