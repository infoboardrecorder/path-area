import hull from 'hull.js';
import ngeohash from 'ngeohash';

// Coordinates are in [longitude, latitude] format
export type Coordinates = [number, number];

export class PathArea {
  public readonly areaSq = 14.98084045960135;
  private precision = 9;
  private spacing = 3; // meters

  /**
   * Calculates the distance between two points (in meters) using the Haversine formula
   * @param start [longitude, latitude]
   * @param end [longitude, latitude]
   * @returns distance in meters
   * @returns {Coordinates[]} - An array of interpolated coordinates.
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
   * Interpolates coordinates between two points.
   *
   * @param {Coordinates} start - The starting coordinates.
   * @param {Coordinates} end - The ending coordinates.
   * @returns {Coordinates[]} - An array of interpolated coordinates.
   */
  private interpolatePath(start: Coordinates, end: Coordinates): Coordinates[] {
    const coordinates: Coordinates[] = [];

    // if start & end are the same, no need to interpolate
    if (start[1] === end[1] && start[0] === end[0]) {
      return [start, end];
    }

    const totalDistance = this.distance(start, end);
    const numPoints = Math.max(2, Math.round(totalDistance / this.spacing));

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
   * Calculates the path coordinates between a series of given coordinates.
   *
   * @param {Coordinates[]} coordinates - An array of coordinates to calculate the path.
   * @returns {Coordinates[]} - An array of path coordinates.
   */
  public coordinates(coordinates: Coordinates[]): Coordinates[] {
    const pathCoordinates: Coordinates[] = [coordinates[0]];

    for (let i = 0; i < coordinates.length - 1; i++) {
      // drop the first coordinate as it's already added
      const [, ...path] = this.interpolatePath(coordinates[i], coordinates[i + 1]);
      pathCoordinates.push(...path);
    }

    return pathCoordinates;
  }

  /**
   * Generates geohashes from an array of coordinates.
   *
   * @param {Coordinates[]} coordinates - The array of coordinates.
   * @return {Set<string>} - A Set of geohashes generated from the coordinates.
   */
  public geohashes(coordinates: Coordinates[]): Set<string> {
    const output = new Set<string>();

    this.coordinates(coordinates).forEach((coordinate) => {
      output.add(ngeohash.encode(coordinate[1], coordinate[0], this.precision));
    });

    return output;
  }

  /**
   * Calculate area
   * @param {Set<string>} geohashes - A Set of geohashes.
   * @returns m²
   */
  public computeArea(geohashes: Set<string>): number {
    return geohashes.size * this.areaSq;
  }

  /**
   * Calculate area of path
   * @returns m²
   */
  public area(coordinates: Coordinates[]): number {
    const geohashes = this.geohashes(coordinates);
    return this.computeArea(geohashes);
  }

  /**
   *
   * Converts geohash to coordinates
   * @returns {Coordinates[]} - An array of coordinates at each corner.
   */
  private geohashToCorners(geohash: string): Coordinates[] {
    const bbox = ngeohash.decode_bbox(geohash);

    return [
      [bbox[1], bbox[0]], // bottom left corner
      [bbox[3], bbox[0]], // bottom right corner
      [bbox[3], bbox[2]], // top right corner
      [bbox[1], bbox[2]], // top left corner
    ];
  }

  /**
   *
   * @param {Set<string>} geohashes - A Set of geohashes to generate polygon from.
   * @param {number} concavity
   * @returns {Coordinates[]} - An array of polygon coordinates.
   */
  public generatePolygon(geohashes: Set<string>, concavity: number = 0.00000000001): Coordinates[] {
    let coordinates: ReturnType<PathArea['geohashToCorners']> = [];

    geohashes.forEach((geohash) => {
      coordinates = coordinates.concat(this.geohashToCorners(geohash));
    });

    const output = hull(coordinates, concavity) as Coordinates[];

    return output.map((point) => {
      return point;
    });
  }

  /**
   *
   * @param {Coordinates[]} coordinates - The array of coordinates.
   * @param {number} concavity
   * @returns {Coordinates[]} - An array of polygon coordinates.
   */
  public polygon(coordinates: Coordinates[], concavity: number = 0.00000000001): Coordinates[] {
    const geohashes = this.geohashes(coordinates);
    return this.generatePolygon(geohashes, concavity);
  }
}
