import geohash from 'ngeohash';

export type Coordinates = [number, number];

export class PathArea {
  private areaSq: number;

  constructor(
    private precision: 7 | 8 | 9 = 9,
    private maxPoints = 10,
    private maxSpeed = 20,
  ) {
    this.areaSq = new Map<typeof precision, number>([
      [9, 22.7529], // 4.77m x 4.77m
      [8, 729.62], // 38.2m x 19.1m
      [7, 23409], // 153m x 153m
    ]).get(precision) as number;
  }

  /**
   * 
   * @param start [longitude, latitude]
   * @param end [longitude, latitude]
   * @param numPoints speedBetweenThoseTwo
   * @returns [longitude, latitude]
   */
  public interpolateCoordinates(start: Coordinates, end: Coordinates, numPoints: number): Coordinates[] {
    const data: Coordinates[] = [];

    for (let i = 1; i <= numPoints; i++) {
      const fraction = i / (numPoints + 1);
      const interpolatedX = start[0] + (end[0] - start[0]) * fraction;
      const interpolatedY = start[1] + (end[1] - start[1]) * fraction;
      data.push([interpolatedX, interpolatedY]);
    }

    return data;
  }

  /**
   *
   * @param data [[longitude, latitude], speedBetweenThoseTwo]
   * @returns geohash[]
   */
  public geohashes(data: [Coordinates, number][]): Set<string> {
    const output = new Set<string>();

    for (let i = 0; i < data.length - 1; i++) {
      const start = data[i][0];
      const end = data[i + 1][0];
      output.add(geohash.encode(start[1], start[0], this.precision));

      // Check if start and end points are the same
      if (start[0] === end[0] && start[1] === end[1]) {
        continue;
      }

      // max 10 points for 20km/h
      const numPoints = Math.min(Math.ceil((data[i][1] * this.maxPoints) / this.maxSpeed), this.maxPoints);

      const interpolatedPoints = this.interpolateCoordinates(start, end, numPoints);

      interpolatedPoints.forEach((p) => output.add(geohash.encode(p[1], p[0], this.precision)));
    }

    // add the last coordinate missing from loop
    const last = data[data.length - 1][0];
    output.add(geohash.encode(last[1], last[0], this.precision));
    return output;
  }

  public computeArea(geohashes: Set<string>): number {
    return geohashes.size * this.areaSq;
  }

  /**
   *
   * @param data [[longitude, latitude], speedBetweenThoseTwo]
   * @returns m²
   */
  public area(data: [Coordinates, number][]): number {
    const geohashes = this.geohashes(data);
    return this.computeArea(geohashes);
  }
}
