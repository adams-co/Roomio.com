import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = (import.meta.env.VITE_AUTH_API_URL as string | undefined)?.replace(/\/+$/, "") || "http://localhost:5000";
const toAssetUrl = (url: string) => (url.startsWith("http") ? url : `${API_URL}${url}`);

export interface HostelShort {
  id: string;
  user_id: string;
  hostel_id: string | null;
  title: string;
  video_url: string;
  price: string;
  description: string;
  location: string;
  created_at: string;
}

interface NewShortPayload {
  hostel_id?: string | null;
  title: string;
  video: File;
  price: string;
  description: string;
  location: string;
}

export const useShorts = () => {
  return useQuery({
    queryKey: ["shorts"],
    queryFn: async (): Promise<HostelShort[]> => {
      const res = await fetch(`${API_URL}/api/content/shorts`);
      if (!res.ok) return [];
      const body = await res.json();
      const data = (body?.data as HostelShort[]) || [];
      return data.map((s) => ({ ...s, video_url: toAssetUrl(s.video_url) }));
    },
  });
};

export const useCreateShort = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewShortPayload) => {
      const form = new FormData();
      form.append("title", payload.title);
      form.append("video", payload.video);
      form.append("price", payload.price);
      form.append("description", payload.description);
      form.append("location", payload.location);
      if (payload.hostel_id) form.append("hostel_id", payload.hostel_id);

      const res = await fetch(`${API_URL}/api/content/shorts`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to upload short");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shorts"] });
    },
  });
};

export const useDeleteShort = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shortId: string) => {
      const res = await fetch(`${API_URL}/api/content/shorts/${shortId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete short");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shorts"] });
    },
  });
};
