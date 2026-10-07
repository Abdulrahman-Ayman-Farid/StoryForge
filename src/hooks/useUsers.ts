import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { User } from "@/types/user";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.getAll();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (email: string, name: string) => {
    const response = await api.users.create({ email, name });
    setUsers([...users, response.data]);
    return response.data;
  };

  const deleteUser = async (id: string) => {
    await api.users.delete(id);
    setUsers(users.filter((u) => u.id !== id));
  };

  return { users, loading, error, refetch: fetchUsers, createUser, deleteUser };
}
