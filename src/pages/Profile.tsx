
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Edit, Check, X, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type ProfileData = {
  full_name: string;
  id: string;
  role?: "admin" | "operator" | "passenger" | null;
};

export default function Profile() {
  const { user, loading: userLoading, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch profile on mount or when user changes; now includes 'role'
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setNameInput(data.full_name || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
    setNameError(null);
    setNameInput(profile?.full_name || "");
  };

  const handleCancel = () => {
    setEditing(false);
    setNameError(null);
    setNameInput(profile?.full_name || "");
  };

  const handleSave = async () => {
    const newName = nameInput.trim();
    setNameError(null);
    if (!newName) {
      setNameError("Name cannot be empty");
      return;
    }
    setSaveLoading(true);

    const { count, error: dupError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("full_name", newName)
      .neq("id", user?.id);

    if (dupError) {
      setNameError("Failed to check usernames. Please try again.");
      setSaveLoading(false);
      return;
    }
    if (count && count > 0) {
      setNameError("That name is already taken. Try another one.");
      setSaveLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: newName })
      .eq("id", user?.id);

    if (updateError) {
      setNameError(updateError.message || "Error updating name");
      setSaveLoading(false);
      return;
    }

    const { data: updatedData, error: fetchError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user?.id)
      .maybeSingle();

    setSaveLoading(false);

    if (fetchError || !updatedData) {
      setProfile((old) => old ? { ...old, full_name: newName } : old);
      setNameInput(newName);
      setEditing(false);
      toast.success("Username updated!");
      return;
    }
    setProfile(updatedData);
    setNameInput(updatedData.full_name || "");
    setEditing(false);
    toast.success("Username updated!");
  };

  // Enhanced delete account handler
  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const access_token = sessionData?.session?.access_token ?? "";

      const res = await fetch(
        "https://opwcpqijoxytqzjvopyw.functions.supabase.co/delete-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const result = await res.json();
      setDeleting(false);

      if (res.ok && result?.success) {
        toast.success("Your account was permanently deleted.");
        setDeleteDialogOpen(false);
        await supabase.auth.signOut();
        navigate("/");
      } else {
        toast.error(result?.error || "Failed to delete account. Contact support.");
      }
    } catch (e: any) {
      setDeleting(false);
      toast.error("Error deleting account.");
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Avatar className="mb-2">
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          {/* Username area with inline edit */}
          <div className="w-full flex justify-center items-center gap-2 mt-2">
            {editing ? (
              <>
                <Input
                  autoFocus
                  className="w-40"
                  value={nameInput}
                  maxLength={40}
                  onChange={(e) => setNameInput(e.target.value)}
                  disabled={saveLoading}
                />
                <Button size="icon" variant="ghost" onClick={handleSave} disabled={saveLoading}>
                  {saveLoading ? <Loader2 className="animate-spin" /> : <Check />}
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancel} disabled={saveLoading}>
                  <X />
                </Button>
              </>
            ) : (
              <>
                <CardTitle>
                  {(profile?.full_name && profile.full_name.trim()) ||
                    (nameInput && nameInput.trim()) ||
                    "No name set"}
                </CardTitle>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edit Name"
                  className="ml-1"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          {nameError && (
            <div className="text-destructive text-sm mt-1">{nameError}</div>
          )}
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="block font-medium text-muted-foreground">Email:</span>
            <span>{user.email}</span>
          </div>
          <div>
            <span className="block font-medium text-muted-foreground">Role:</span>
            <span>
              {/* Show role from profile if set, otherwise fallback */}
              {profile?.role
                ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                : "unknown"}
            </span>
          </div>
        </CardContent>
        <div className="px-6 pb-6 flex gap-2 flex-col sm:flex-row">
          <Button
            className="w-full"
            onClick={() => navigate("/")}
            variant="secondary"
          >
            Home
          </Button>
          <Button className="w-full" variant="destructive" onClick={logout}>
            Log out
          </Button>
          {/* Delete Account Button */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
              >
                <Delete className="mr-2" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to permanently delete your account?
                  <br />
                  <span className="text-destructive">This action cannot be undone.</span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? <Loader2 className="animate-spin mr-1" /> : <Delete className="mr-1" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
