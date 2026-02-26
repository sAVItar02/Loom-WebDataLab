import { createSession, getSession, getSessions } from "../apis/session.api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./queryKeys"
import { toast } from "react-hot-toast"

export const useSessions = () => {
    return useQuery({
        queryKey: queryKeys.sessions,
        queryFn: getSessions,
        staleTime: 1000 * 60 * 5,
    })
}

export const useCreateSession = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.sessions })
            toast.success("Session created successfully")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })
}

export const useSession = (id: string) => {
    return useQuery({
        queryKey: queryKeys.session(Number(id)),
        queryFn: () => getSession(id),
        staleTime: 1000 * 60 * 5,
    })
}