import toast from "react-hot-toast";
import { createPage, getPages } from "../apis/page.api";
import { queryKeys } from "./queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePages = (sessionId: string) => {
    return useQuery({
        queryKey: queryKeys.pages(sessionId),
        queryFn: () => getPages(sessionId),
        enabled: !!sessionId,
        staleTime: 1000 * 60 * 5,
    })
}

export const useCreatePage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ sessionId, url, selector }: { sessionId: string, url: string, selector: string }) => createPage(sessionId, url, selector),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.pages(variables.sessionId), refetchType: "active" });
            toast.success("Page created successfully");
        }, onError: (error) => {
            toast.error(error.message); 
        },
    });
};