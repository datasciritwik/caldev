import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export const useNodes = (projectId) => {
    const { api } = useAuth();
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['nodes', projectId],
        queryFn: async () => {
            const response = await api.get(`/api/projects/${projectId}/nodes`);
            return response.data;
        },
        enabled: !!projectId,
    });

    const createNode = useMutation({
        mutationFn: async (newNode) => {
            const response = await api.post(`/api/projects/${projectId}/nodes`, newNode);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes', projectId] });
        },
    });

    const updateNode = useMutation({
        mutationFn: async ({ id, ...updateData }) => {
            const response = await api.put(`/api/projects/${projectId}/nodes/${id}`, updateData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes', projectId] });
        },
    });

    const deleteNode = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/api/projects/${projectId}/nodes/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nodes', projectId] });
        },
    });

    return {
        ...query,
        createNode,
        updateNode,
        deleteNode,
    };
};

export const useUsers = () => {
    const { api } = useAuth();

    return useQuery({
        queryKey: ['users'],
        query_fn: async () => {
            const response = await api.get('/api/users/search?q=');
            return response.data;
        },
    });
};
