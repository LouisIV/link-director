import { Promise } from 'es6-promise';
import { INVALID_NAME_ERROR, NULL_NAME_ERROR, USED_NAME_ERROR } from './errorMessages';
import { IDirectedLink, IDirection, IDirectionArgParams, IDirectionArgs, IDirections, IDirectorConfig } from './types';
// import { ASSUMPTION_WARNING, FALLBACK_WARNING } from './warnings';

export class LinkDirector {
  /**
   * Configure LinkDirector
   * @param config {IDirectorConfig}
   */
  public static Configure(config?: IDirectorConfig) {
    if (!config) {
      return { settings: this.settingsInternal, directions: this.directionsInternal };
    }

    const { directions, settings } = config;

    if (directions) {
      this.configureDirections(directions);
    }

    if (settings) {
      this.configureSettings(settings);
    }
  }

  /**
   * Configure directions
   * @param directions {IDirections}
   */
  public static configureDirections(directions?: IDirections) {
    if (!directions) {
      return this.directionsInternal;
    }
    this.directionsInternal = (Object as any).assign(this.directionsInternal, directions);
    return this.directionsInternal;
  }

  /**
   * Configure settings
   * @param settings {object}
   */
  public static configureSettings(settings?: object) {
    if (!settings) {
      return this.settingsInternal;
    }
    this.settingsInternal = (Object as any).assign(this.settingsInternal, settings);
    return this.settingsInternal;
  }

  /**
   * Adds a direction to the LinkDirector
   * @param name {string} Name of the new Direction
   * @param direction {IDirection} The new Direction
   */
  public static addDirection(name: string, direction: IDirection) {
    if (name in this.directionsInternal) {
      // console.error(USED_NAME_ERROR);
      // console.log(`'${name}' is already a direction!`);
      throw Error(USED_NAME_ERROR);
    }
    // TODO: Add validation
    this.directionsInternal[name] = direction;

    return {
      name: direction.director,
    };
  }

  public static direct(name: string, args: IDirectionArgs) {
    return new Promise<IDirectedLink>((resolve, reject: any) => {
      // Validate name
      if (!name) {
        // console.log(NULL_NAME_ERROR);
        reject(NULL_NAME_ERROR);
      }

      // Check that key exists
      const direction = this.directionsInternal[name];
      if (!direction) {
        reject(INVALID_NAME_ERROR);
      }

      // Define something in case args is null
      const approvedArgs: IDirectionArgs = args || {};

      // Check for an alternate 'link' key
      const link = direction.director[approvedArgs.altLink ? approvedArgs.altLink : 'link'];

      if (!link) {
        const fallback = `www.${name}.com`;

        if (!this.settingsInternal || !this.settingsInternal.noWarnOnFallback) {
          // console.warn(FALLBACK_WARNING);
        }

        const returnObj = {
          icon: direction.icon || name,
          link: fallback,
        };

        resolve(returnObj);
      }

      const { map, url } = link;

      /**
       * "map": {
       *    "$HANDLE": "handle",
       *    "$USERNAME": "username"
       * }
       * or
       * "map": [ "$HANDLE", "$USERNAME" ]
       */

      // Force deep copy
      let urlCopy = ` ${url}`.slice(1);

      if (!map) {
        // console.warn(ASSUMPTION_WARNING);

        // eslint-disable-next-line no-useless-escape
        const regex = /(\$[^\$]+\$)/m;
        let m;

        const numTries = Object.keys(args).length;

        const params: IDirectionArgParams = approvedArgs.params || {};

        for (let i = 0; i < numTries; i += 1) {
          m = regex.exec(urlCopy);
          if (m !== null) {
            const match: string = m[0];
            const argKey: string = match.toLowerCase();

            const argValue: string = params[argKey] || '';

            if (!argValue || argValue.length === 0) {
              // console.warn(`Replacement was assumed but not found: ${match} => args.${argKey}`);
            } else {
              // Preform the replacement
              urlCopy = urlCopy.replace(match, argValue);
            }
          }
        }

        const returnObj = {
          icon: direction.icon || name,
          link: urlCopy,
        };

        resolve(returnObj);
      } else if (Array.isArray(map)) {
        // eslint-disable-next-line no-useless-escape
        const regex = /(\$[^\$]+\$)/m;
        map.forEach(replacement => {
          urlCopy = urlCopy.replace(regex, replacement);
        });

        const returnObj = {
          icon: direction.icon || name,
          link: urlCopy,
        };

        resolve(returnObj);
      }
    });
  }

  private static directionsInternal: IDirections = {};

  private static settingsInternal: any = {};
}
