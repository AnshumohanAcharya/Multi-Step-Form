"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import {
  setStep,
  updatePersonalInfo,
  updateAddress,
  updatePreferences,
} from "@/lib/features/form-slice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { store, type RootState } from "@/lib/store";

// Form schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const addressSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "Please select a state"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
});

const preferencesSchema = z.object({
  notifications: z.boolean(),
  newsletter: z.boolean(),
  theme: z.string(),
});

const FormStep = ({
  children,
  title,
  isActive,
}: {
  children: React.ReactNode;
  title: string;
  isActive: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 20 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      {children}
    </div>
  </motion.div>
);

export const MultiStepForm = () => {
  const dispatch = useDispatch();
  const { step } = useSelector((state: RootState) => state.form);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize forms for each step
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const preferencesForm = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      notifications: false,
      newsletter: false,
      theme: "system",          
    },
    mode: "onChange", // Enable real-time validation
  });
  
  // Add an effect to update form when Redux state changes
  useEffect(() => {
    const { preferences } = store.getState().form;
    preferencesForm.reset({
      notifications: preferences.notifications,
      newsletter: preferences.newsletter,
      theme: preferences.theme
    });
  }, []);
  
  const resetForms = () => {
    personalForm.reset();
    addressForm.reset();
    preferencesForm.reset();
    dispatch(setStep(1));
  };

  // Handle form submissions
  const handlePersonalSubmit = async (
    data: z.infer<typeof personalInfoSchema>
  ) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/form-data", {
        method: "POST",
        body: JSON.stringify({ personalInfo: data }),
      });
      dispatch(updatePersonalInfo(data));
      dispatch(setStep(2));
      toast({
        title: "Success!",
        description: "Personal information saved.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save personal information.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleAddressSubmit = async (data: z.infer<typeof addressSchema>) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/form-data", {
        method: "POST",
        body: JSON.stringify({ address: data }),
      });
      dispatch(updateAddress(data));
      dispatch(setStep(3));
      toast({
        title: "Success!",
        description: "Address saved.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save address.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handlePreferencesSubmit = async (
    data: z.infer<typeof preferencesSchema>
  ) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/form-data", {
        method: "POST",
        body: JSON.stringify({ preferences: data }),
      });
      dispatch(updatePreferences(data));
      dispatch(setStep(4));
      toast({
        title: "Success!",
        description: "Preferences saved.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save preferences.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const finalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/form-data", {
        method: "POST",
        body: JSON.stringify({ status: "completed" }),
      });
      toast({
        title: "Congratulations!",
        description: "Your form has been submitted successfully.",
      });
      // Reset all forms and go back to step 1
      resetForms();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {step === 1 && "Personal Information"}
          {step === 2 && "Address Details"}
          {step === 3 && "Preferences"}
          {step === 4 && "Review & Submit"}
        </CardTitle>
        <Progress value={step * 25} className="w-full mt-4" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <FormStep title="Tell us about yourself" isActive={step === 1}>
              <form
                onSubmit={personalForm.handleSubmit(handlePersonalSubmit)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...personalForm.register("firstName")}
                      className="mt-1"
                    />
                    {personalForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {personalForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...personalForm.register("lastName")}
                      className="mt-1"
                    />
                    {personalForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {personalForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...personalForm.register("email")}
                      className="mt-1"
                    />
                    {personalForm.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {personalForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </FormStep>
          )}

          {step === 2 && (
            <FormStep
              title="Where should we send your mail?"
              isActive={step === 2}
            >
              <form
                onSubmit={addressForm.handleSubmit(handleAddressSubmit)}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      {...addressForm.register("street")}
                      className="mt-1"
                    />
                    {addressForm.formState.errors.street && (
                      <p className="text-sm text-destructive mt-1">
                        {addressForm.formState.errors.street.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...addressForm.register("city")}
                        className="mt-1"
                      />
                      {addressForm.formState.errors.city && (
                        <p className="text-sm text-destructive mt-1">
                          {addressForm.formState.errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        onValueChange={(value) =>
                          addressForm.setValue("state", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...addressForm.register("zipCode")}
                      className="mt-1"
                    />
                    {addressForm.formState.errors.zipCode && (
                      <p className="text-sm text-destructive mt-1">
                        {addressForm.formState.errors.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </FormStep>
          )}

          {step === 3 && (
            <FormStep title="Set your preferences" isActive={step === 3}>
              <form
                onSubmit={preferencesForm.handleSubmit(handlePreferencesSubmit)}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifications"
                      checked={preferencesForm.watch("notifications")}
                      onCheckedChange={(checked) => {
                        preferencesForm.setValue(
                          "notifications",
                          checked as boolean
                        );
                      }}
                    />
                    <Label
                      htmlFor="notifications"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable notifications
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={preferencesForm.watch("newsletter")}
                      onCheckedChange={(checked) => {
                        preferencesForm.setValue(
                          "newsletter",
                          checked as boolean
                        );
                      }}
                    />
                    <Label
                      htmlFor="newsletter"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subscribe to newsletter
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme Preference</Label>
                    <Select
                      value={preferencesForm.watch("theme")}
                      onValueChange={(value) => {
                        preferencesForm.setValue("theme", value);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  {preferencesForm.formState.errors.notifications && (
                    <p className="text-sm text-destructive">
                      {preferencesForm.formState.errors.notifications.message}
                    </p>
                  )}
                  {preferencesForm.formState.errors.newsletter && (
                    <p className="text-sm text-destructive">
                      {preferencesForm.formState.errors.newsletter.message}
                    </p>
                  )}
                  {preferencesForm.formState.errors.theme && (
                    <p className="text-sm text-destructive">
                      {preferencesForm.formState.errors.theme.message}
                    </p>
                  )}
                </div>
              </form>
            </FormStep>
          )}

          {step === 4 && (
            <FormStep title="Review your information" isActive={step === 4}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Name:</p>
                    <p>
                      {personalForm.getValues("firstName")}{" "}
                      {personalForm.getValues("lastName")}
                    </p>
                    <p>Email:</p>
                    <p>{personalForm.getValues("email")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Address</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Street:</p>
                    <p>{addressForm.getValues("street")}</p>
                    <p>City:</p>
                    <p>{addressForm.getValues("city")}</p>
                    <p>State:</p>
                    <p>{addressForm.getValues("state")}</p>
                    <p>ZIP Code:</p>
                    <p>{addressForm.getValues("zipCode")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Preferences</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Notifications:</p>
                    <p>
                      {preferencesForm.getValues("notifications")
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                    <p>Newsletter:</p>
                    <p>
                      {preferencesForm.getValues("newsletter")
                        ? "Subscribed"
                        : "Not subscribed"}
                    </p>
                    <p>Theme:</p>
                    <p className="capitalize">
                      {preferencesForm.getValues("theme")}
                    </p>
                  </div>
                </div>
              </div>
            </FormStep>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch(setStep(step - 1))}
          disabled={step === 1 || isSubmitting}
          className="w-28"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => {
            if (step === 1) personalForm.handleSubmit(handlePersonalSubmit)();
            else if (step === 2)
              addressForm.handleSubmit(handleAddressSubmit)();
            else if (step === 3)
              preferencesForm.handleSubmit(handlePreferencesSubmit)();
            else if (step === 4) finalSubmit();
          }}
          disabled={isSubmitting}
          className="w-28"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {step === 4 ? (
                <>
                  Submit
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MultiStepForm;
