//frontend\src\components\dialog
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, setUser } from "@/features/auth/authSlice";
import client from "@/api/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const UsernameDialog = () => {
  const { user } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isOpen = !!(user && !user.username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await client.post("/api/user/set-username", {
        username,
      });
      dispatch(setUser({ ...user, username }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set username");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {}} // Prevent closing
    >
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()} // Disable outside click
        onEscapeKeyDown={(e) => e.preventDefault()} // Disable escape key
      >
        <DialogHeader>
          <DialogTitle>Set Your Username</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a unique username"
              disabled={isLoading}
              className="col-span-3"
            />
            {error && (
              <Alert variant="destructive" className="col-span-4">
                <AlertCircle className="h-4 w-4 " />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !username}
          onClick={handleSubmit}
        >
          {isLoading ? "Saving..." : "Save Username"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameDialog;
