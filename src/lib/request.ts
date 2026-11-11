import { backend } from "@/axios-client";
import { AxiosError } from "axios";

export interface RequestConfig {
  body?: object;
  queryParams?: object;
}

interface ErrorResponse {
  statusCode: number;
  data: string;
}

interface UnknownError {
  cause: string;
}

/**
 * Result that contains a `result` or an `error`, but not both.
 */
export type Result<T> =
  | { result: T; error?: never }
  | { result?: never; error: ErrorResponse | UnknownError };

/**
 * Makes a request to the backend with the given `method` and `path`. Additionally, you
 * can provide body and query parameters in the `requestConfig`. Returns a `Result`
 * containing either `result` on success or `error` on error.
 * @param method - HTTP method
 * @param path - Resource path (not including the base URL)
 * @param requestConfig - additionally request parameters
 * @returns `Result` containing `result` key on success or `error` key on error
 */
export async function request<T>(
  method: string,
  path: string,
  requestConfig?: RequestConfig,
): Promise<Result<T>> {
  try {
    // const req: AxiosRequestConfig
    const response = await backend.request<T>({
      method: method,
      url: path,
      data: requestConfig?.body,
      params: requestConfig?.queryParams,
    });

    return {
      result: response.data,
    };
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      return {
        error: {
          statusCode: err.response.status,
          data: err.response.data,
        },
      };
    }

    return {
      error: {
        cause: "getJournal",
      },
    };
  }
}
