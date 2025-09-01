import type { Transformer } from '@remark-embedder/core'

import providers, { type Provider } from './providers'

// TODO: Support providers that do not have schemes
function getProviderEndpointURLForURL(
  url: string,
): {provider: Provider; endpoint: string} | null {
  for (const provider of providers) {
    for (const endpoint of provider.endpoints) {
      if (
        'schemes' in endpoint && endpoint.schemes?.some(scheme =>
          new RegExp(scheme.replace(/\*/g, '(.*)')).test(url),
        )
      ) {
        return { provider, endpoint: endpoint.url }
      }
    }
  }
  return null
}

type Config = {
  params?: {[key: string]: unknown}
}

type GetConfig = ({
  url,
  provider,
}: {
  url: string
  provider: Provider
}) => Config | null | undefined

type OEmbedData = {
  html: string
}

const transformer: Transformer<Config | GetConfig> = {
  name: '@remark-embedder/transformer-oembed',
  shouldTransform: async url => {
    const result = getProviderEndpointURLForURL(url)
    return Boolean(result)
  },
  getHTML: async (urlString, getConfig = {}) => {
    const result = getProviderEndpointURLForURL(urlString)

    // istanbul ignore if (shouldTransform prevents this, but if someone calls this directly then this would save them)
    if (!result) return null

    const {provider, endpoint} = result

    const url = new URL(endpoint)
    url.searchParams.set('url', urlString)

    let config: Config = getConfig as Config
    if (typeof getConfig === 'function') {
      // I really have no idea what's happening here:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      config = getConfig({url: urlString, provider}) ?? {}
    }

    for (const [key, value] of Object.entries(config.params ?? {})) {
      url.searchParams.set(key, String(value))
    }

    // format has to be json so it is not configurable
    url.searchParams.set('format', 'json')

    const res = await fetch(url.toString())
    const data = (await res.json()) as OEmbedData

    return data.html
  },
}

export default transformer
type ExportedConfig = Config | GetConfig
export type { ExportedConfig as Config }
