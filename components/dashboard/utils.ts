import { compact, omit } from 'lodash';

export const makePushSubpath = router => subpath => {
  router.push(
    {
      pathname: compact([router.pathname, router.query.slug, router.query.section, subpath]).join('/'),
      query: omit(router.query, ['slug', 'section', 'subpath']),
    },
    undefined,
    {
      shallow: true,
    },
  );
};
