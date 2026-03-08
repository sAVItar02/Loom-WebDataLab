import { useQuery } from "@tanstack/react-query"
import { getPreview } from "../apis/preview.api"
import { queryKeys } from "./queryKeys"

export const usePreview = (url: string) => {
    return useQuery({
        queryKey: queryKeys.preview(url),
        queryFn: () => getPreview(url),
        enabled: !!url,
        staleTime: 1000 * 60 * 5,
    })
}