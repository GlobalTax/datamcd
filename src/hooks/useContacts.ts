import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateContactData, UpdateContactData, Contact, ContactType } from "@/types/contact";
import { useToast } from "@/hooks/use-toast";

export const useContacts = (contactType?: ContactType) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: contacts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contacts", contactType],
    queryFn: async () => {
      let query = supabase
        .from("contacts")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (contactType) {
        query = query.eq("contact_type", contactType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Contact[];
    },
  });

  const createContact = useMutation({
    mutationFn: async (contactData: CreateContactData) => {
      const { data, error } = await supabase
        .from("contacts")
        .insert({
          ...contactData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Contacto creado",
        description: "El contacto se ha creado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el contacto.",
        variant: "destructive",
      });
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateContactData & { id: string }) => {
      const { data, error } = await supabase
        .from("contacts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Contacto actualizado",
        description: "El contacto se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el contacto.",
        variant: "destructive",
      });
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contacts")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast({
        title: "Contacto eliminado",
        description: "El contacto se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto.",
        variant: "destructive",
      });
    },
  });

  return {
    contacts,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
  };
};