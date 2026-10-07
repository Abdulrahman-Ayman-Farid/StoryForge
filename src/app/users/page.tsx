import UserList from "@/components/UserList";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">User Management</h1>
        <UserList />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Users",
  description: "User management page",
};
