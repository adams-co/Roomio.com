import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const STORAGE_BUCKET = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined)?.trim() || "roomio-media";

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
      const { data, error } = await supabase.from("hostel_shorts").select("*").order("created_at", { ascending: false });
      if (error) return [];
      return (data as HostelShort[]) || [];
    },
  });
};

export const useCreateShort = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: NewShortPayload) => {
      const rawUser = localStorage.getItem("roomio_user");
      const user = rawUser ? (JSON.parse(rawUser) as { id?: string } | null) : null;
      if (!user?.id) throw new Error("Sign in required");

      const ext = payload.video.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `shorts/videos/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const upload = await supabase.storage.from(STORAGE_BUCKET).upload(path, payload.video, { upsert: false });
      if (upload.error) throw upload.error;

      const video_url = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;

      const { error } = await supabase.from("hostel_shorts").insert({
        user_id: user.id,
        hostel_id: payload.hostel_id || null,
        title: payload.title,
        video_url,
        price: payload.price,
        description: payload.description,
        location: payload.location,
      });
      if (error) throw error;
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
      const { error } = await supabase.from("hostel_shorts").delete().eq("id", shortId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shorts"] });
    },
  });
};
