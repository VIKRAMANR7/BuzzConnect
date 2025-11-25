import { useAuth } from "@clerk/clerk-react";
import { Pencil } from "lucide-react";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { updateUser } from "../features/user/userSlice";
import type { RootState } from "../types/store";
import { useAppDispatch } from "../app/useAppDispatch";

interface Props {
  setShowEdit: (open: boolean) => void;
}

export default function ProfileModal({ setShowEdit }: Props) {
  const dispatch = useAppDispatch();
  const { getToken } = useAuth();

  const user = useSelector((state: RootState) => state.user.value);

  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    full_name: user?.full_name || "",
    profile_picture: null as File | null,
    cover_photo: null as File | null,
  });

  const handleSaveProfile = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const token = await getToken();
      if (!token) {
        toast.error("Authentication error");
        return;
      }

      const form = new FormData();
      form.append("username", editForm.username);
      form.append("bio", editForm.bio);
      form.append("location", editForm.location);
      form.append("full_name", editForm.full_name);

      if (editForm.profile_picture) form.append("profile", editForm.profile_picture);
      if (editForm.cover_photo) form.append("cover", editForm.cover_photo);

      dispatch(updateUser({ userData: form, token }));
      setShowEdit(false);
    },
    [editForm, getToken, dispatch, setShowEdit]
  );

  // If user is missing → render nothing (but AFTER hooks).
  if (!user) return null;

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

          <form
            className="space-y-4"
            onSubmit={(e) => toast.promise(handleSaveProfile(e), { loading: "Saving..." })}
          >
            {/* Profile Picture */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    profile_picture: e.target.files?.[0] ?? null,
                  })
                }
              />
              <div className="group/profile relative">
                <img
                  src={
                    editForm.profile_picture
                      ? URL.createObjectURL(editForm.profile_picture)
                      : user.profile_picture
                  }
                  className="size-24 rounded-full object-cover mt-2"
                />
                <div className="absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center">
                  <Pencil className="size-5 text-white" />
                </div>
              </div>
            </label>

            {/* Cover Photo */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Photo
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cover_photo: e.target.files?.[0] ?? null,
                  })
                }
              />
              <div className="group/cover relative">
                <img
                  src={
                    editForm.cover_photo
                      ? URL.createObjectURL(editForm.cover_photo)
                      : user.cover_photo
                  }
                  className="w-80 h-40 rounded-lg object-cover mt-2"
                />
                <div className="absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center">
                  <Pencil className="size-5 text-white" />
                </div>
              </div>
            </label>

            {/* Name */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </label>

            {/* Username */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </label>

            {/* Bio */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
              <textarea
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </label>

            {/* Location */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
              <input
                type="text"
                className="w-full p-3 border border-gray-200 rounded-lg"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </label>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
