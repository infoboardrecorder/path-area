import { Coordinates, PathArea } from '../';

describe('PathArea', () => {
  let pathArea: PathArea;
  const data: Coordinates[] = [
    [14.473332850127251, 48.97409857459967],
    [14.47504408709137, 48.9739190201761],
    [14.47536059313894, 48.975017809401905],
    [14.473595669866297, 48.97521495026121],
    [14.473332850127251, 48.97409857459967], // same as start
  ];

  beforeEach(() => {
    pathArea = new PathArea();
  });

  test('Generate geohashes from coordinates', () => {
    const geohashes = pathArea.geohashes(data);
    expect(geohashes.size).toEqual(138);
  });

  test('Generate path coordinates', () => {
    const coordinates = pathArea.coordinates(data);

    expect(Array.isArray(coordinates)).toBeTruthy();
    expect(coordinates.length).toEqual(166);

    expect(coordinates[0][1]).toEqual(48.97409857459967);
    expect(coordinates[0][0]).toEqual(14.473332850127251);

    expect(coordinates[1][1]).toEqual(48.974094195223486);
    expect(coordinates[1][0]).toEqual(14.473374587614181);

    expect(coordinates[2][1]).toEqual(48.9740898158473);
    expect(coordinates[2][0]).toEqual(14.47341632510111);

    expect(coordinates[3][1]).toEqual(48.97408543647112);
    expect(coordinates[3][0]).toEqual(14.47345806258804);

    expect(coordinates[4][1]).toEqual(48.974081057094935);
    expect(coordinates[4][0]).toEqual(14.47349980007497);

    expect(coordinates[5][1]).toEqual(48.97407667771875);
    expect(coordinates[5][0]).toEqual(14.4735415375619);
  });

  test('Compute area from geohashes', () => {
    const geohashes = new Set<string>(['u2fkbnhux', 'u2fkbnjh8']);
    const area = pathArea.computeArea(geohashes);
    expect(area).toEqual(pathArea.areaSq * 2);
  });

  test('Compute area from coordinates', () => {
    const area = pathArea.area(data);
    expect(area).toEqual(138 * pathArea.areaSq);
  });

  test('Same coordinates', () => {
    const data2: Coordinates[] = [
      [14.473332850127251, 48.97409857459967],
      [14.473332850127251, 48.97409857459967],
    ];

    const coordinates = pathArea.coordinates(data2);
    expect(coordinates.length).toEqual(2);
  });

  test('Compute distance', () => {
    const data3: Coordinates[] = [
      [14.473332850127251, 48.97409857459967],
      [14.47504408709137, 48.9739190201761],
    ];
    const distance = pathArea.distance(data3[0], data3[1]);
    expect(Math.round(distance)).toEqual(126);
  });
});
