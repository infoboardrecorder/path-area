import { PathArea, Coordinates } from '../';

describe('PathArea', () => {
  let pathArea: PathArea;
  const data: [Coordinates, number][] = [
    [[14.473332850127251, 48.97409857459967], 20],
    [[14.47504408709137, 48.9739190201761], 20],
    [[14.47536059313894, 48.975017809401905], 20],
    [[14.473595669866297, 48.97521495026121], 0],
  ];

  beforeEach(() => {
    pathArea = new PathArea();
  });

  test('Interpolate coordinates', () => {
    const start: Coordinates = [0, 0];
    const end: Coordinates = [10, 10];
    const numPoints = 4;
    const interpolated = pathArea.interpolateCoordinates(start, end, numPoints);

    expect(interpolated.length).toBe(numPoints);
    expect(interpolated[0]).toEqual([2, 2]);
    expect(interpolated[1]).toEqual([4, 4]);
    expect(interpolated[2]).toEqual([6, 6]);
    expect(interpolated[3]).toEqual([8, 8]);
  });

  test('Generate geohashes from coordinates and speed', () => {
    const geohashes = pathArea.geohashes(data);
    expect(geohashes.size).toEqual(34); // (start + end)*4 + (10 between)*3
  });

  test('Compute are from geohashes', () => {
    const geohashes = new Set<string>(['u2fkbnhux', 'u2fkbnjh8']);
    const area = pathArea.computeArea(geohashes);
    expect(area).toEqual(22.7529 * 2);
  });

  test('Compute area from coordinates', () => {
    const area = pathArea.area(data);
    expect(area).toEqual(773.5986);
  });

  test('Same coordinates', () => {
    const data2: [Coordinates, number][] = [
      [[14.473332850127251, 48.97409857459967], 0],
      [[14.473332850127251, 48.97409857459967], 20],
      [[14.47536059313894, 48.975017809401905], 0],
    ];

    const geohashes = pathArea.geohashes(data2);
    expect(geohashes.size).toEqual(12); // unique(start + end)*2 + (10 between)
  });
});
