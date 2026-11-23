import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Spec extends TurboModule {
}

let xtzModule: Spec | null;

/**
 * @private
 */
export const getXTZTurboModule = (): Spec => {
  try {
    if (xtzModule == null) {
      // 1. Load XTZ TurboModule
      xtzModule = TurboModuleRegistry.getEnforcing<Spec>('Xtz');

      if (xtzModule == null) {
        throw new Error(
          `Failed to install xtz-jsi: The native module could not be found.`
        );
      }
    }

    return xtzModule;
  } catch (cause) {
    // TurboModule could not be found!
    throw cause;
  }
}
