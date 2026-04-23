import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Books queries
export const useBooks = (searchQuery = '', categoryId: number | null = null, sortBy = 'created_at', sortOrder = 'desc') => {
    return useQuery({
        queryKey: ['books', searchQuery, categoryId, sortBy, sortOrder],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (categoryId) params.append('category', categoryId.toString());
            params.append('sort', sortBy);
            params.append('order', sortOrder);

            const endpoint = searchQuery || categoryId
                ? `${API_URL}/books/search?${params.toString()}`
                : `${API_URL}/books/`;

            const { data } = await axios.get(endpoint);
            return data;
        },
    });
};

export const useBook = (bookId: number) => {
    return useQuery({
        queryKey: ['book', bookId],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/books/${bookId}`);
            return data;
        },
        enabled: !!bookId,
    });
};

// Categories query
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/categories/`);
            return data;
        },
        staleTime: 10 * 60 * 1000, // Categories don't change often, cache for 10 minutes
    });
};

// User profile queries
export const useUserProfile = (token: string | null) => {
    return useQuery({
        queryKey: ['userProfile', token],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/profile/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: !!token,
    });
};

// Update profile mutation
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ token, profileData }: { token: string; profileData: FormData }) => {
            const { data } = await axios.put(`${API_URL}/profile/`, profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch user profile
            queryClient.invalidateQueries({ queryKey: ['userProfile', variables.token] });
        },
    });
};

// Reading progress queries
export const useReadingProgress = (bookId: number, token: string | null) => {
    return useQuery({
        queryKey: ['readingProgress', bookId, token],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/reading-progress/${bookId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: !!token && !!bookId,
    });
};

// Update reading progress mutation
export const useUpdateReadingProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bookId, page, token }: { bookId: number; page: number; token: string }) => {
            const formData = new FormData();
            formData.append('current_page', page.toString());

            const { data } = await axios.post(`${API_URL}/reading-progress/${bookId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        onSuccess: (_, variables) => {
            // Invalidate reading progress for this book
            queryClient.invalidateQueries({ queryKey: ['readingProgress', variables.bookId, variables.token] });
        },
    });
};

// Admin stats query
export const useAdminStats = (token: string | null) => {
    return useQuery({
        queryKey: ['adminStats', token],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
        enabled: !!token,
        staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    });
};

// Author info query
export const useAuthorInfo = () => {
    return useQuery({
        queryKey: ['authorInfo'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/author/info`);
            return data;
        },
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
};

// Timeline query
export const useTimeline = () => {
    return useQuery({
        queryKey: ['timeline'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/author/timeline`);
            return data;
        },
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    });
};
