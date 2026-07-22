"use client";

import { Google } from "@/utils/icons";
import { addToast, Button } from "@heroui/react";
import { useCallback } from "react";

type GoogleLoginButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "startContent" | "onPress"
>;

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ variant = "faded", ...props }) => {
  const handleGoogleLogin = useCallback(async () => {
    addToast({
      title: "Sorry, Google login is temporarily unavailable.",
      color: "warning",
    });
  }, []);

  return (
    <Button
      startContent={<Google width={24} />}
      onPress={handleGoogleLogin}
      variant={variant}
      {...props}
    >
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
