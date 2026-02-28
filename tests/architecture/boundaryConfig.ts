import { globSync } from 'glob';

export const FACADE_BOUNDARY_MODULES = [
  'scene',
  'timeline',
  'renderer',
  'cache',
  'animations',
  'errors',
  'camera',
] as const;

export const FACADE_BOUNDARY_GLOBS = [
  'src/core/scene/**/*.ts',
  'src/core/timeline/**/*.ts',
  'src/core/renderer/**/*.ts',
  'src/core/cache/**/*.ts',
  'src/core/animations/**/*.ts',
  'src/core/errors/**/*.ts',
  'src/core/camera/**/*.ts',
] as const;

export const ALLOWED_ANIMATION_IMPORTS: RegExp[] = [
  /^(\.\.\/)+animations\/mobjectApi$/,
];

export const CROSS_MODULE_EXCEPTIONS: Record<string, string[]> = {
  'src/core/camera/CameraFrame.ts': [
    '../animations/mobjectApi',
  ],
};

export function collectArchitectureFiles(): {
  mobjectFiles: string[];
  mathFiles: string[];
  facadeBoundaryFiles: string[];
} {
  const mobjectFiles = globSync('src/core/mobjects/**/*.ts', { posix: true });
  const mathFiles = globSync('src/core/math/**/*.ts', { posix: true });
  const facadeBoundaryFiles = FACADE_BOUNDARY_GLOBS.flatMap((pattern) =>
    globSync(pattern, { posix: true }),
  );

  return { mobjectFiles, mathFiles, facadeBoundaryFiles };
}
