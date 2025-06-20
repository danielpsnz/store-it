"use client";

// Import UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

/**
 * Modal component to input a 6-digit OTP sent to the user's email.
 * Used for verifying user identity post sign-up or sign-in.
 *
 * Props:
 * - accountId: Unique user account identifier
 * - email: Email address where OTP is sent
 */
const OtpModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter();

  // Modal open/close state
  const [isOpen, setIsOpen] = useState(true);

  // Stores the 6-digit OTP entered by the user
  const [password, setPassword] = useState("");

  // Tracks loading state during OTP verification
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles OTP submission.
   * Calls backend to verify the 6-digit code entered by the user.
   * On success, redirects user to home page.
   */
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sessionId = await verifySecret({ accountId, password });

      if (sessionId) {
        router.push("/"); // Redirect to homepage upon successful verification
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      // Optional: show user-facing error message here
    }

    setIsLoading(false);
  };

  /**
   * Resends the OTP to the user's email.
   * Useful if the user did not receive the code initially.
   */
  const handleResendOtp = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        {/* Header with title, description and close button */}
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>

          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We've sent a code to{" "}
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* OTP Input Fields (6 slots) */}
        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
          </InputOTPGroup>
        </InputOTP>

        {/* Submit button and resend option */}
        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            {/* Resend link for when OTP is not received */}
            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn't get a code?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
                onClick={handleResendOtp}
              >
                Click to resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
