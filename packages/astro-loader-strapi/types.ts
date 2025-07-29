

export type StrapiErrorResponse = {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: {
      key: string;
      paht: null;
      source: string;
      param: string;
    }
  }
}

export type StrapiSuccessResponse<TData, TMeta = unknown> = {
  data: TData;
  meta: TMeta;
}

export type StrapiCollectionResponse<T> = StrapiSuccessResponse<T[], {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}>;

export type StrapiEntityResponse<T> = StrapiSuccessResponse<T>

export type StrapiResponse = StrapiErrorResponse | StrapiSuccessResponse<unknown>

export const isError = (response: StrapiErrorResponse | StrapiResponse): response is StrapiErrorResponse =>
  !!('error' in response)

export const isEntity = <T>(
  item: StrapiEntityResponse<T> | StrapiCollectionResponse<T>,
  singleEntity = false
): item is StrapiEntityResponse<T> => !!singleEntity;