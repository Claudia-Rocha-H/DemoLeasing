import { useCallback, useState } from "react";
import { fileRequest } from "../lib/requestsApi";
import type { FileRequestPayload, FiledRequest } from "../models/requests";

type RequestState = {
  isLoading: boolean;
  data: FiledRequest | null;
  error: string | null;
};

export function useFileRequest() {
  const [state, setState] = useState<RequestState>({
    isLoading: false,
    data: null,
    error: null
  });

  const mutate = useCallback(async (payload: FileRequestPayload) => {
    setState({ isLoading: true, data: null, error: null });
    try {
      const data = await fileRequest(payload);
      setState({ isLoading: false, data, error: null });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      setState({ isLoading: false, data: null, error: message });
      return null;
    }
  }, []);

  return {
    mutate,
    ...state
  };
}
