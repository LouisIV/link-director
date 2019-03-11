import { NULL_NAME_ERROR, INVALID_NAME_ERROR } from '../src/errorMessages';

const director = require('../src'); // require the `index.js` file from the same directory.

const config = {
  instagram: {
    icon: 'instagram',
    link: {
      url: 'instagram://user?username=$HANDLE$',
    },
  },
};

const snapDirection = {
  director: {
    icon: 'snapchat',
    link: {
      url: 'www.snapchat.com?=$ONE$&$TWO$&$THREE$',
      map: ['one', 'two', 'three'],
    },
  },
  metadata: {
    name: 'snapchat',
  },
};

const configWithSnap = {
  ...config,
  snapchat: {
    ...snapDirection.director,
  },
};

describe('configuration', () => {
  test('Configures', () => {
    director.configure(config);
  });

  test('Holds configuration', () => {
    expect(director.configure()).toEqual(config);
  });

  test('Add direction', () => {
    director.addDirection(snapDirection);
    expect(director.configure()).toEqual(configWithSnap);
  });
});

describe('Direct failures', () => {
  test('Null key fails', () => director
    .direct(null, { not: 'a', real: 'arg' })
    .catch(e => expect(e).toMatch(NULL_NAME_ERROR)));
  test('Empty key fails', () => director.direct('', { not: 'a', real: 'arg' }).catch(e => expect(e).toMatch(NULL_NAME_ERROR)));
  test('Invalid key fails', () => director
    .direct('aaa', { not: 'a', real: 'arg' })
    .catch(e => expect(e).toMatch(INVALID_NAME_ERROR)));
  // test("Empty args fails", () => {
  //   return director
  //     .direct("instagram", {})
  //     .catch(e => expect(e).toMatch(NULL_ARGS_ERROR));
  // });
});

describe('Direct', () => {
  test('Provides link fallback', () => director.direct('instagram', { altLink: 'fail' }).then((directed) => {
    expect(directed.icon).toMatch(config.instagram.icon);
    expect(directed.link).toMatch('www.instagram.com');
  }));
  test("Provides correct link and icon with map as '{}'", () => director.direct('instagram', { $handle$: 'hello-world' }).then((directed) => {
    expect(directed.icon).toMatch(config.instagram.icon);
    expect(directed.link).toMatch('instagram://user?username=hello-world');
  }));
  test("Provides correct link and icon with map as '[]'", () => director.direct('snapchat', null).then((directed) => {
    expect(directed.icon).toMatch(configWithSnap.snapchat.icon);
    expect(directed.link).toMatch('www.snapchat.com?=one&two&three');
  }));
});
