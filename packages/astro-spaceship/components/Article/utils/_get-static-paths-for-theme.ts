
import { getStaticPathsFactory, type GetStaticPathsFactoryConfig, type Props } from './get-static-paths'

export const getStaticPathsForThemeFactory = (factoryConfig: GetStaticPathsFactoryConfig) => {
  const getStaticPaths = getStaticPathsFactory(factoryConfig);

  return (async (theme: string) => {
    const allStaticPaths = await getStaticPaths();

    const staticPath = allStaticPaths.find(
      p => p.params.slug === `customization/built-in-themes/${theme}/${theme}`
    ) ?? allStaticPaths.find(
      p => p.params.slug === 'examples/cheatsheets/markdown-cheatsheet'
    );

    return staticPath;
  })
}

export type {
  Props
}