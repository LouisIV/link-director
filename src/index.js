/* eslint-disable no-console */
/* eslint-disable func-names */
// Initialize the module
import { NULL_NAME_ERROR, INVALID_NAME_ERROR } from './errorMessages';

module.exports.configure = function (directionsData) {
  // Return directions
  if (!directionsData) return this.directions;

  this.directions = {};

  // Change the configuration
  this.directions = Object.assign(this.directions, directionsData);

  return this;
};

module.exports.addDirection = function (direction) {
  // Check for metadata
  const { metadata } = direction;
  if (!metadata) {
    console.error("All directions must have 'metadata'!");
    return false;
  }

  // Check for name
  const { name } = direction.metadata;
  if (!name) {
    console.error("'name' was not provided!");
    return false;
  }

  // TODO: Add validation
  // TODO: Check that name doesn't already exist

  this.directions[name] = direction.director;

  return name;
};

module.exports.direct = function (name, args) {
  return new Promise((resolve, reject) => {
    // Validate name
    if (!name) {
      console.log(NULL_NAME_ERROR);
      reject(NULL_NAME_ERROR);
    } else if (name.length === 0) {
      console.log(NULL_NAME_ERROR);
      reject(NULL_NAME_ERROR);
    }

    // Validate args
    if (!args) {
      // eslint-disable-next-line no-param-reassign
      args = {};
    }

    // Check that key exists
    const direction = this.directions[name];
    if (!direction) {
      reject(INVALID_NAME_ERROR);
    }

    // Check for an alternate 'link' key
    const link = direction[args.altLink ? args.altLink : 'link'];

    if (!link) {
      const fallback = `www.${name}.com`;
      console.warn(`Using fallback, ${fallback}`);

      const returnObj = {
        icon: direction.icon || '',
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
      // TODO: Add warnOnAssumptions
      console.warn(
        'No "map" was provided! Assuming link...\nYou can disable this warning in your config by adding, "warnOnAssumptions": false',
      );

      // eslint-disable-next-line no-useless-escape
      const regex = /(\$[^\$]+\$)/m;
      let m;

      const numTries = Object.keys(args).length;

      for (let i = 0; i < numTries; i += 1) {
        // eslint-disable-next-line no-cond-assign
        if ((m = regex.exec(urlCopy)) !== null) {
          const match = m[0];
          const argKey = match.toLowerCase();

          const argValue = args[argKey];

          if (!argValue || argValue.length === 0) {
            console.warn(`Replacement was assumed but not found: ${match} => args.${argKey}`);
          } else {
            // Preform the replacement
            urlCopy = urlCopy.replace(match, argValue);
          }
        }
      }

      const returnObj = {
        icon: direction.icon || '',
        link: urlCopy,
      };

      resolve(returnObj);
    } else if (Array.isArray(map)) {
      // eslint-disable-next-line no-useless-escape
      const regex = /(\$[^\$]+\$)/m;
      map.forEach((replacement) => {
        urlCopy = urlCopy.replace(regex, replacement);
      });

      const returnObj = {
        icon: direction.icon || '',
        link: urlCopy,
      };

      resolve(returnObj);
    }
  });
};
