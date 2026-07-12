import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppRail from "@/components/layout/AppRail";
import Avatar from "@/components/common/Avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Camera, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { profileApi } from "@/lib/api";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          username: response.data.username || "",
          bio: response.data.bio || "",
          avatar: response.data.avatar || "",
        });
        if (response.data.avatar) {
          setAvatarPreview(response.data.avatar);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);

        toast({
          title: "Preview updated",
          description: "Image upload functionality will be added soon!",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setSaving(true);
    
    const completelyCleanedPayload = {};
    
    if (formData.username && formData.username.trim() !== "") {
      completelyCleanedPayload.username = formData.username.trim();
    }
    if (formData.bio && formData.bio.trim() !== "") {
      completelyCleanedPayload.bio = formData.bio.trim();
    }
    if (formData.avatar && formData.avatar.trim() !== "") {
      completelyCleanedPayload.avatar = formData.avatar.trim();
    }

    console.log(" ABSOLUTE CLEAN PAYLOAD:", completelyCleanedPayload);

    const response = await profileApi.updateProfile(completelyCleanedPayload);
    
    if (response.success) {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setProfile(response.data);
    }
  } catch (error) {
    // 4. Print out the exact error message the backend is sending back
    console.error("Backend Error Message:", error.response?.data);
    
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to update profile",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};

  const initials = profile
    ? profile.username
      ? profile.username.slice(0, 2).toUpperCase()
      : "US"
    : "US";

  const avatarColor = profile?.avatarColor || "from-rose-400 to-orange-300";

  if (loading) {
    return (
      <div className="h-screen w-full flex bg-mesh overflow-hidden">
        <AppRail />
        <main className="flex-1 overflow-y-auto scroll-elegant flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-mesh overflow-hidden">
      <AppRail />
      <main className="flex-1 overflow-y-auto scroll-elegant">
        <div className="max-w-3xl mx-auto px-6 py-10 sm:py-14 space-y-8">
          <div className="animate-slide-up">
            <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">Profile</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage how you appear to others</p>
          </div>

          <section className="glass rounded-4xl p-6 sm:p-8 shadow-soft animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="relative shrink-0 mx-auto sm:mx-0">
                <Avatar
                  src={avatarPreview || formData.avatar}
                  initials={initials}
                  color={avatarColor}
                  size="2xl"
                />
                <label className="absolute bottom-1 right-1 h-12 w-12 rounded-2xl bg-background border grid place-items-center shadow-soft hover:scale-105 transition cursor-pointer">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="sr-only"
                    id="avatar-upload"
                  />
                </label>
              </div>
              <div className="flex-1 w-full space-y-6">
                <Field label="Username">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-8 h-11 rounded-2xl bg-background/60"
                      placeholder="Enter username"
                      disabled={loading}
                    />
                  </div>
                </Field>

                <Field label="Bio">
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="rounded-2xl bg-background/60 resize-none"
                    placeholder="Tell people about yourself..."
                    disabled={loading}
                  />
                </Field>

                <Field label="Avatar URL">
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={handleChange}
                    className="h-11 rounded-2xl bg-background/60"
                    placeholder="https://example.com/avatar.png"
                    disabled={loading}
                  />
                </Field>

                <div className="flex justify-end pt-4 border-t border-border/50">
                  <Button
                    onClick={handleSubmit}
                    disabled={saving || loading}
                    className="h-11 px-8 rounded-2xl gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {profile && (
            <section className="glass rounded-4xl p-6 sm:p-8 shadow-soft animate-fade-in">
              <h2 className="font-display text-xl font-semibold mb-6">Account Info</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs truncate">{profile._id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="truncate">{profile.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Member since</p>
                  <p>{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last seen</p>
                  <p>{profile.lastSeen ? new Date(profile.lastSeen).toLocaleDateString() : "—"}</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-[0.14em] text-muted-foreground font-semibold">{label}</label>
      {children}
    </div>
  );
}