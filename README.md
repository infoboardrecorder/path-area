# PathArea

[![build](https://github.com/infoboardrecorder/path-area/actions/workflows/build.yaml/badge.svg)](https://github.com/infoboardrecorder/path-area/actions/workflows/build.yaml)

Converts path coordinates to area (m²)

<p align="center">
  <img src="./img/result.png " alt="result" height="200">
</p>

```ts
import { Coordinates, PathArea } from '@infoboardrecorder/path-area';

const pathArea = new PathArea();
const data: Coordinates[] = [
  [14.473332850127251, 48.97409857459967],
  [14.473332850127251, 48.97409857459967],
  [14.47536059313894, 48.975017809401905],
];

const area = pathArea.area(data);
console.log(area);
```
