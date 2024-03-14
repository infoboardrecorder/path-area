# PathArea
```ts
import { Coordinates, PathArea } from '@infoboardrecorder/path-area';

const pathArea = new PathArea();
const data: [Coordinates, number][] = [
    [[14.473332850127251, 48.97409857459967], 0],
    [[14.473332850127251, 48.97409857459967], 20],
    [[14.47536059313894, 48.975017809401905], 0],
];

const area = pathArea.area(data);
console.log(area)
```
