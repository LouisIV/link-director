import { LinkDirector as director } from '../index';

import * as messages from '../errorMessages';

const redditDirector = {
  director: {
    link: {
      url: 'www.reddit.com',
    },
  },
  icon: '',
};

const snapDirector = {
  director: {
    link: {
      map: ['one', 'two', 'three'],
      url: 'www.snapchat.com?=$ONE$&$TWO$&$THREE$',
    },
  },
  icon: '',
};

const config = {
  directions: {
    instagram: {
      director: {
        link: {
          url: 'instagram://user?username=$HANDLE$',
        },
      },
      icon: 'instagram',
    },
    reddit: {
      ...redditDirector,
    },
  },
  settings: {},
};

const configWithSnap = {
  directions: {
    ...config.directions,
    snapchat: {
      ...snapDirector,
    },
  },
  settings: {},
};

describe('configuration', () => {
  test('Configures', () => {
    director.Configure(config);
  });

  test('Holds configuration', () => {
    expect(director.Configure()).toEqual(config);
  });

  test("Calling 'configureDirections' without args returns all directions", () => {
    expect(director.configureDirections()).toEqual(config.directions);
  });

  test("Calling 'configureSettings' without args returns all settings", () => {
    expect(director.configureSettings()).toEqual(config.settings);
  });

  test('Add direction', () => {
    director.addDirection('snapchat', snapDirector);
    expect(director.Configure()).toMatchObject(configWithSnap);
  });
});

describe('Direct failures', () => {
  test('Null key fails', () =>
    director
      .direct(null, { params: { not: 'a', real: 'arg' } })
      .catch(e => expect(e).toMatch(messages.NULL_NAME_ERROR)));
  test('Empty key fails', () =>
    director.direct('', { params: { not: 'a', real: 'arg' } }).catch(e => expect(e).toMatch(messages.NULL_NAME_ERROR)));
  test('Invalid key fails', () =>
    director
      .direct('aaa', { params: { not: 'a', real: 'arg' } })
      .catch(e => expect(e).toMatch(messages.INVALID_NAME_ERROR)));
});

describe('Direct', () => {
  test('Provides link fallback', () =>
    director.direct('instagram', { altLink: 'fail' }).then(directed => {
      expect(directed.icon).toMatch(config.directions.instagram.icon);
      expect(directed.link).toMatch('www.instagram.com');
    }));
  test('Provides icon fallback', () =>
    director.direct('snapchat', { altLink: 'fail' }).then(directed => {
      expect(directed.icon).toMatch('snapchat');
      expect(directed.link).toMatch('www.snapchat.com');
    }));
  test('Provides icon fallback without map', () =>
    director.direct('reddit', { altLink: 'fail' }).then(directed => {
      expect(directed.icon).toMatch('reddit');
      expect(directed.link).toMatch('www.reddit.com');
    }));
  test("Provides correct link and icon with map as '{}'", () =>
    director.direct('instagram', { params: { $handle$: 'hello-world' } }).then(directed => {
      expect(directed.icon).toMatch(config.directions.instagram.icon);
      expect(directed.link).toMatch('instagram://user?username=hello-world');
    }));
  test('Args defined but with no params', () =>
    director.direct('instagram', {}).then(directed => {
      expect(directed.icon).toMatch(config.directions.instagram.icon);
      expect(directed.link).toMatch(config.directions.instagram.director.link.url);
    }));
  test('Map missing key', () =>
    director.direct('instagram', { params: { $fakeKey$: 'hello-world' } }).then(directed => {
      expect(directed.icon).toMatch(config.directions.instagram.icon);
      expect(directed.link).toMatch(config.directions.instagram.director.link.url);
    }));
  test("Provides correct link and icon with map as '[]'", () =>
    director.direct('snapchat', null).then(directed => {
      expect(directed.icon).toMatch(configWithSnap.directions.snapchat.icon);
      expect(directed.link).toMatch('www.snapchat.com?=one&two&three');
    }));
});
