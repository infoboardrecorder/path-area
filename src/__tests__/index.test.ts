import { PathArea, Coordinates } from '../';

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

  test('Generate geohashes from coordinates and speed', () => {
    const geohashes = pathArea.geohashes(data);
    expect(geohashes.size).toEqual(136);
  });

  test('Generate path coordinates', () => {
    const coordinates = pathArea.coordinates(data);
    expect(Array.isArray(coordinates)).toBeTruthy();
    expect(coordinates.length).toEqual(172);

    expect(coordinates[0][1]).toEqual(48.97409857459967);
    expect(coordinates[0][0]).toEqual(14.473332850127251);

    expect(coordinates[1][1]).toEqual(48.97409429949435);
    expect(coordinates[1][0]).toEqual(14.473373593864492);

    expect(coordinates[2][1]).toEqual(48.97409002438903);
    expect(coordinates[2][0]).toEqual(14.473414337601733);

    expect(coordinates[3][1]).toEqual(48.9740857492837);
    expect(coordinates[3][0]).toEqual(14.473455081338974);

    expect(coordinates[4][1]).toEqual(48.97408147417838);
    expect(coordinates[4][0]).toEqual(14.473495825076215);

    expect(coordinates[5][1]).toEqual(48.97407719907306);
    expect(coordinates[5][0]).toEqual(14.473536568813456);
  });

  test('Compute area from geohashes', () => {
    const geohashes = new Set<string>(['u2fkbnhux', 'u2fkbnjh8']);
    const area = pathArea.computeArea(geohashes);
    expect(area).toEqual(22.7529 * 2);
  });

  test('Compute area from coordinates', () => {
    const area = pathArea.area(data);
    expect(area).toEqual(136 * 22.7529);
  });

  test('Same coordinates', () => {
    const data2: Coordinates[] = [
      [14.473332850127251, 48.97409857459967],
      [14.473332850127251, 48.97409857459967],
    ];

    const coordinates = pathArea.coordinates(data2);
    expect(coordinates.length).toEqual(3);
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
